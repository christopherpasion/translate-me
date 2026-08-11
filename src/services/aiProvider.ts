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
  const apiKey = settings.apiKey || DEFAULT_KEY;

  if (settings.provider === 'gemini' || apiKey) {
    try {
      return await translateWithGeminiAPI(chapterId, rawChinese, glossary, apiKey);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in engine:', err);
    }
  }

  // Fallback / Built-in Engine
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

  const systemPrompt = `You are a professional Chinese web novel translator specializing in Xianxia, Wuxia, and Xuanhuan.
Translate the raw Chinese text into clean, high-quality, fluent English prose.

STRICT GLOSSARY MAPPING RULES:
You MUST strictly use the following active glossary translations for names, places, and terms:
${activeTerms || '(No specific glossary terms required)'}

Output ONLY the translated English text. Do not add conversational intro/outro commentary.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

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

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const translatedEn = data?.candidates?.[0]?.content?.parts?.[0]?.text || rawChinese;

  return {
    translatedEn,
    selfHealedRecords: [],
    activeGlossaryCount: glossary.length
  };
}
