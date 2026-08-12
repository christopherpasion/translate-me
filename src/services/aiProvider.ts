import type { GlossaryEntry } from '../types';
import { translateChapterWithSelfHealing, type TranslationResult } from './translationEngine';
import { StorageService } from './storage';

export type AIProvider = 'built-in' | 'gemini' | 'openai' | 'deepseek' | 'groq';

export interface AISettings {
  provider: AIProvider;
  apiKey?: string;
  modelName?: string;
}

const SETTINGS_KEY = 'trans_me_ai_settings_v2';
const DEFAULT_DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-5e12625473254c3194517df12b11edd1';
const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const DEFAULT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export function getAISettings(): AISettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    const defaultSettings: AISettings = {
      provider: 'deepseek',
      apiKey: DEFAULT_DEEPSEEK_KEY,
      modelName: 'deepseek-chat'
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  const parsed = JSON.parse(data);
  // Ensure default to deepseek if provider not set
  if (!parsed.provider) {
    parsed.provider = 'deepseek';
    parsed.apiKey = parsed.apiKey || DEFAULT_DEEPSEEK_KEY;
  }
  return parsed;
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

let lastApiCallTime = 0;
const API_COOLDOWN_MS = 5000;

/**
 * High-level translation router
 * Dispatches to DeepSeek or Gemini API if configured with API key, otherwise uses built-in engine
 */
export async function translateChapterWithAI(
  chapterId: string,
  rawChinese: string,
  glossary: GlossaryEntry[]
): Promise<TranslationResult> {
  const now = Date.now();
  if (now - lastApiCallTime < API_COOLDOWN_MS && lastApiCallTime !== 0) {
    console.warn('[TranslateMe] API cooldown guard: Request throttled to protect key balance. Using Built-In Local Engine.');
    const event = new CustomEvent('translation-error', {
      detail: {
        message: '⏳ Please wait 5 seconds between translations to protect your API balance. Using Built-In Local Engine.',
        provider: 'API Cooldown Guard'
      }
    });
    window.dispatchEvent(event);
    return translateChapterWithSelfHealing(chapterId, rawChinese, glossary);
  }
  lastApiCallTime = now;

  const settings = getAISettings();
  const deepseekKey = settings.provider === 'deepseek' ? (settings.apiKey || DEFAULT_DEEPSEEK_KEY) : DEFAULT_DEEPSEEK_KEY;
  const geminiKey = settings.provider === 'gemini' ? (settings.apiKey || DEFAULT_GEMINI_KEY) : DEFAULT_GEMINI_KEY;
  const groqKey = settings.provider === 'groq' ? (settings.apiKey || DEFAULT_GROQ_KEY) : DEFAULT_GROQ_KEY;

  // Try DeepSeek API first if selected or available
  if (settings.provider === 'deepseek' || (deepseekKey && !geminiKey)) {
    try {
      return await translateWithDeepSeekAPI(chapterId, rawChinese, glossary, deepseekKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] DeepSeek API failed:', message);
      const isBalanceError = message.includes('402') || message.includes('Insufficient Balance');
      const friendlyMsg = isBalanceError
        ? 'DeepSeek account balance is empty ($0). Switched active AI Engine to Built-In Local.'
        : `DeepSeek API Error: ${message}`;
      
      // Auto-switch saved setting to built-in local so future translations use local engine immediately
      saveAISettings({ ...settings, provider: 'built-in' });

      const event = new CustomEvent('translation-error', {
        detail: { message: friendlyMsg, provider: 'DeepSeek API' }
      });
      window.dispatchEvent(event);
    }
  } else if (settings.provider === 'gemini' || geminiKey) {
    try {
      return await translateWithGeminiAPI(chapterId, rawChinese, glossary, geminiKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] Gemini API failed:', message);
      const isKeyError = message.includes('400') || message.includes('API key not valid');
      const friendlyMsg = isKeyError
        ? 'Gemini API Key is invalid or expired. Switched active AI Engine to Built-In Local.'
        : `Gemini API Error: ${message}`;

      // Auto-switch saved setting to built-in local so future translations use local engine immediately
      saveAISettings({ ...settings, provider: 'built-in' });

      const event = new CustomEvent('translation-error', {
        detail: { message: friendlyMsg, provider: 'Gemini API' }
      });
      window.dispatchEvent(event);
    }
  } else if (settings.provider === 'groq' || groqKey) {
    try {
      return await translateWithGroqAPI(chapterId, rawChinese, glossary, groqKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] Groq API failed:', message);
      const friendlyMsg = message.includes('401') || message.includes('Invalid')
        ? 'Groq API Key is invalid. Switched active AI Engine to Built-In Local.'
        : `Groq API Error: ${message}`;

      // Auto-switch saved setting to built-in local so future translations use local engine immediately
      saveAISettings({ ...settings, provider: 'built-in' });

      const event = new CustomEvent('translation-error', {
        detail: { message: friendlyMsg, provider: 'Groq API' }
      });
      window.dispatchEvent(event);
    }
  }

  // Fallback to built-in Xianxia engine if API call fails
  return translateChapterWithSelfHealing(chapterId, rawChinese, glossary);
}

/**
 * DeepSeek-V3 Chat Completions Translation Engine
 */
async function translateWithDeepSeekAPI(
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
1. NATURAL NARRATIVE LOWERCASE: Use natural English lowercasing in descriptive prose (e.g. "middle-aged Chinese man", "golden slit pupils", "pitch-black water") rather than robotic, capitalized machine terms.
2. HIGH-RHYTHM PREPOSITIONAL CADENCE: Avoid literal, stiff translations. Translate speech tags and actions naturally.
3. IDIOMATIC NOVEL PHRASING:
   - 科技造物 -> "artificially engineered life-form"
   - 车脊 -> "roofs of the cars"
   - 回收遗体 -> "recovered her body"
   - 入土为安 -> "proper burial"
   - 血肉横飞 -> "one of the bloody casualties"
4. ZERO CONVERSATIONAL NOISE: Output ONLY the clean, translated English prose matching paragraph by paragraph. Do not add intro, markdown commentary, or outro notes.`;

  const url = 'https://api.deepseek.com/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawChinese }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const translatedEn = data?.choices?.[0]?.message?.content || '';

  if (!translatedEn) {
    throw new Error('DeepSeek returned an empty response.');
  }

  // Record usage metrics from API response
  const promptTokens = data?.usage?.prompt_tokens || Math.ceil(rawChinese.length * 1.5);
  const completionTokens = data?.usage?.completion_tokens || Math.ceil(translatedEn.length / 4);
  StorageService.addTokenUsage(promptTokens, completionTokens);

  return {
    translatedEn,
    selfHealedRecords: [],
    activeGlossaryCount: glossary.length
  };
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
2. HIGH-RHYTHM PREPOSITIONAL CADENCE: Avoid literal, stiff translations. Translate speech tags and actions naturally.
3. IDIOMATIC NOVEL PHRASING:
   - 科技造物 -> "artificially engineered life-form"
   - 车脊 -> "roofs of the cars"
   - 回收遗体 -> "recovered her body"
   - 入土为安 -> "proper burial"
   - 血肉横飞 -> "one of the bloody casualties"
4. ZERO CONVERSATIONAL NOISE: Output ONLY the clean, translated English prose matching paragraph by paragraph. Do not add intro or outro notes.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

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

/**
 * Groq Cloud API (Llama 3.3 70B) Translation Engine — FREE
 * Uses OpenAI-compatible Chat Completions format
 */
async function translateWithGroqAPI(
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
1. NATURAL NARRATIVE LOWERCASE: Use natural English lowercasing in descriptive prose rather than robotic, capitalized machine terms.
2. HIGH-RHYTHM PREPOSITIONAL CADENCE: Avoid literal, stiff translations. Translate speech tags and actions naturally.
3. IDIOMATIC NOVEL PHRASING: Translate idioms and expressions into natural English equivalents.
4. ZERO CONVERSATIONAL NOISE: Output ONLY the clean, translated English prose matching paragraph by paragraph. Do not add intro, markdown commentary, or outro notes.`;

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawChinese }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const translatedEn = data?.choices?.[0]?.message?.content || '';

  if (!translatedEn) {
    throw new Error('Groq returned an empty response.');
  }

  // Record usage metrics from API response
  const promptTokens = data?.usage?.prompt_tokens || Math.ceil(rawChinese.length * 1.5);
  const completionTokens = data?.usage?.completion_tokens || Math.ceil(translatedEn.length / 4);
  StorageService.addTokenUsage(promptTokens, completionTokens);

  return {
    translatedEn,
    selfHealedRecords: [],
    activeGlossaryCount: glossary.length
  };
}
