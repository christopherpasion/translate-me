import type { GlossaryEntry } from '../types';
import { translateChapterWithSelfHealing, type TranslationResult } from './translationEngine';

export type AIProvider = 'built-in' | 'gemini' | 'openai' | 'deepseek';

export interface AISettings {
  provider: AIProvider;
  apiKey?: string;
  modelName?: string;
}

const SETTINGS_KEY = 'trans_me_ai_settings_v2';
const DEFAULT_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export function getAISettings(): AISettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    const defaultSettings: AISettings = {
      provider: 'gemini',
      apiKey: DEFAULT_KEY,
      modelName: 'gemini-flash-latest'
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  return JSON.parse(data);
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/**
 * High-level translation router
 * Dispatches to Gemini API if configured with API key, otherwise uses built-in engine
 */
export async function translateChapterWithAI(
  chapterId: string,
  rawChinese: string,
  glossary: GlossaryEntry[]
): Promise<TranslationResult> {
  const settings = getAISettings();
  // Always prefer the .env key if available, fallback to localStorage
  const apiKey = DEFAULT_KEY || settings.apiKey || '';

  if (apiKey) {
    try {
      return await translateWithGeminiAPI(chapterId, rawChinese, glossary, apiKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] Gemini API failed:', message);
      // Show visible error notification so user knows what happened
      const event = new CustomEvent('translation-error', { detail: { message } });
      window.dispatchEvent(event);
    }
  } else {
    console.warn('[TranslateMe] No Gemini API key configured. Add VITE_GEMINI_API_KEY to .env');
    const event = new CustomEvent('translation-error', { detail: { message: 'No API key configured. Add your Gemini API key in Settings.' } });
    window.dispatchEvent(event);
  }

  // Fallback to built-in engine only if API key missing or call failed
  return translateChapterWithSelfHealing(chapterId, rawChinese, glossary);
}

async function translateWithGeminiAPI(
  _chapterId: string,
  rawChinese: string,
  glossary: GlossaryEntry[],
  apiKey: string
): Promise<TranslationResult> {
  const activeTerms = glossary
    .filter(g => rawChinese.includes(g.originalZh))
    .map(g => `- ${g.originalZh} -> ${g.translatedEn} (${g.category}${g.gender ? ', ' + g.gender : ''})`)
    .join('\n');

  const systemPrompt = `You are an elite, award-winning Chinese web novel translator and literary editor specializing in Xianxia, Wuxia, Xuanhuan, and Sci-Fi.
Translate the raw Chinese text into clean, high-rhythm, natural, fluent English prose.

STRICT GLOSSARY MAPPING RULES:
You MUST strictly use the following active glossary translations for names, places, and terms:
${activeTerms || '(No specific glossary terms required)'}

LITERARY PROSE & STYLE GUIDELINES:
1. NATURAL NARRATIVE LOWERCASE: Use natural English lowercasing in descriptive prose (e.g. "middle-aged Chinese man", "golden slit pupils", "pitch-black water") rather than robotic, capitalized machine terms like "Chinese Man".
2. HIGH-RHYTHM PREPOSITIONAL CADENCE: Avoid literal, stiff translations. Translate speech tags and actions naturally (e.g., "The Chinese man sighed before explaining..." instead of "The Chinese Man sighed and explained...").
3. IDIOMATIC NOVEL PHRASING:
   - 科技造物 -> "artificially engineered life-form"
   - 车脊 -> "roofs of the cars"
   - 回收遗体 -> "recovered her body"
   - 入土为安 -> "proper burial"
   - 血肉横飞 -> "one of the bloody casualties"
4. ZERO CONVERSATIONAL NOISE: Output ONLY the clean, translated English prose matching paragraph by paragraph. Do not add intro or outro notes.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

  // Retry up to 2 times on 429 rate limit with backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nRaw Chinese Chapter:\n${rawChinese}` }
            ]
          }
        ]
      })
    });

    if (response.status === 429) {
      if (attempt < 3) {
        // Exponential backoff: wait 2s, 4s
        await new Promise(r => setTimeout(r, attempt * 2000));
        continue;
      }
      const errText = await response.text();
      throw new Error(`Gemini API rate limited (429). ${errText}`);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const translatedEn = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!translatedEn) {
      throw new Error('Gemini API returned empty translation. Check API key and quota.');
    }

    return {
      translatedEn,
      selfHealedRecords: [],
      activeGlossaryCount: glossary.length
    };
  }

  throw new Error('Gemini API failed after 3 attempts.');
}
