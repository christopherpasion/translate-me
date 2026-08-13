import type { GlossaryEntry } from '../types';
import { translateChapterWithSelfHealing, type TranslationResult } from './translationEngine';
import { StorageService } from './storage';
import { buildFewShotReferencePrompt } from './referenceAligner';
import { getActiveTrainingRulesPrompt } from './aiTrainingService';
import { customNeuralTranslator } from './customNeuralTranslator';

export type AIProvider = 'custom-neural' | 'built-in' | 'ollama' | 'gemini' | 'openai' | 'deepseek' | 'groq';

export interface AISettings {
  provider: AIProvider;
  apiKey?: string;
  modelName?: string;
  ollamaEndpoint?: string;
  ollamaModel?: string;
}

const SETTINGS_KEY = 'trans_me_ai_settings_v2';
const DEFAULT_DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-5e12625473254c3194517df12b11edd1';
const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const DEFAULT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
export const DEFAULT_OLLAMA_ENDPOINT = 'http://localhost:11434';
export const DEFAULT_OLLAMA_MODEL = 'qwen2.5:7b';

export function getAISettings(): AISettings {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    const defaultSettings: AISettings = {
      provider: 'custom-neural',
      apiKey: DEFAULT_DEEPSEEK_KEY,
      modelName: 'opus-mt-zh-en',
      ollamaEndpoint: DEFAULT_OLLAMA_ENDPOINT,
      ollamaModel: DEFAULT_OLLAMA_MODEL
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  const parsed = JSON.parse(data);
  if (!parsed.provider) {
    parsed.provider = 'custom-neural';
    parsed.apiKey = parsed.apiKey || DEFAULT_DEEPSEEK_KEY;
  }
  if (!parsed.ollamaEndpoint) parsed.ollamaEndpoint = DEFAULT_OLLAMA_ENDPOINT;
  if (!parsed.ollamaModel) parsed.ollamaModel = DEFAULT_OLLAMA_MODEL;
  return parsed;
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function fetchOllamaModels(endpoint: string = DEFAULT_OLLAMA_ENDPOINT): Promise<string[]> {
  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${cleanEndpoint}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data.models)) {
      return data.models.map((m: { name?: string }) => m.name || '').filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}

let lastApiCallTime = 0;
const API_COOLDOWN_MS = 5000;

/**
 * High-level translation router
 * Dispatches to Ollama, DeepSeek, Gemini, or Groq API if configured, otherwise uses built-in engine
 */
export async function translateChapterWithAI(
  chapterId: string,
  rawChinese: string,
  glossary: GlossaryEntry[]
): Promise<TranslationResult> {
  const settings = getAISettings();

  // Local & In-House providers have NO cooldown restrictions
  if (settings.provider !== 'custom-neural' && settings.provider !== 'ollama' && settings.provider !== 'built-in') {
    const now = Date.now();
    if (now - lastApiCallTime < API_COOLDOWN_MS && lastApiCallTime !== 0) {
      console.warn('[TranslateMe] API cooldown guard: Request throttled to protect key balance. Using In-House AI.');
      const event = new CustomEvent('translation-error', {
        detail: {
          message: '⏳ Please wait 5 seconds between cloud translations to protect your API balance. Using Translate-Me Core.',
          provider: 'API Cooldown Guard'
        }
      });
      window.dispatchEvent(event);
      return translateChapterWithSelfHealing(chapterId, rawChinese, glossary);
    }
    lastApiCallTime = now;
  }

  const deepseekKey = settings.provider === 'deepseek' ? (settings.apiKey || DEFAULT_DEEPSEEK_KEY) : DEFAULT_DEEPSEEK_KEY;
  const geminiKey = settings.provider === 'gemini' ? (settings.apiKey || DEFAULT_GEMINI_KEY) : DEFAULT_GEMINI_KEY;
  const groqKey = settings.provider === 'groq' ? (settings.apiKey || DEFAULT_GROQ_KEY) : DEFAULT_GROQ_KEY;

  if (settings.provider === 'custom-neural') {
    // In-House Neural Seq2Seq Transformer Engine
    const translatedEn = await customNeuralTranslator.translateChapter(chapterId, rawChinese, glossary);
    return {
      translatedEn,
      selfHealedRecords: [],
      activeGlossaryCount: glossary.length
    };
  }

  if (settings.provider === 'built-in') {
    // User explicitly chose built-in dictionary — go straight to local engine
    return translateChapterWithSelfHealing(chapterId, rawChinese, glossary);
  }

  if (settings.provider === 'ollama') {
    try {
      const endpoint = settings.ollamaEndpoint || DEFAULT_OLLAMA_ENDPOINT;
      const model = settings.ollamaModel || DEFAULT_OLLAMA_MODEL;
      return await translateWithOllamaAPI(chapterId, rawChinese, glossary, endpoint, model);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] Ollama translation failed:', message);
      const friendlyMsg = `Ollama Connection Error: ${message}. Make sure Ollama is running ('ollama serve' with OLLAMA_ORIGINS='*'). Switched to Built-In Local Engine.`;
      const event = new CustomEvent('translation-error', {
        detail: { message: friendlyMsg, provider: 'Ollama (Local LLM)' }
      });
      window.dispatchEvent(event);
    }
  } else if (settings.provider === 'deepseek') {
    try {
      return await translateWithDeepSeekAPI(chapterId, rawChinese, glossary, deepseekKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] DeepSeek API failed:', message);
      const isBalanceError = message.includes('402') || message.includes('Insufficient Balance');
      const isTimeout = message.includes('aborted') || message.includes('AbortError');
      const friendlyMsg = isBalanceError
        ? 'DeepSeek account balance is empty ($0). Switched active AI Engine to Built-In Local.'
        : isTimeout
          ? 'DeepSeek API request timed out (12s). Falling back to Built-In Local Engine.'
          : `DeepSeek API Error: ${message}`;

      if (isBalanceError || isTimeout) {
        saveAISettings({ ...settings, provider: 'built-in' });
      }

      const event = new CustomEvent('translation-error', {
        detail: { message: friendlyMsg, provider: 'DeepSeek API' }
      });
      window.dispatchEvent(event);
    }
  } else if (settings.provider === 'gemini') {
    try {
      return await translateWithGeminiAPI(chapterId, rawChinese, glossary, geminiKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] Gemini API failed:', message);
      const isKeyError = message.includes('400') || message.includes('API key not valid');
      const isTimeout = message.includes('aborted') || message.includes('AbortError');
      const friendlyMsg = isKeyError
        ? 'Invalid Gemini API key. Please configure a valid key in AI Settings.'
        : isTimeout
          ? 'Gemini API request timed out (12s). Falling back to Built-In Local Engine.'
          : `Gemini API Error: ${message}`;

      const event = new CustomEvent('translation-error', {
        detail: { message: friendlyMsg, provider: 'Gemini API' }
      });
      window.dispatchEvent(event);
    }
  } else if (settings.provider === 'groq') {
    try {
      return await translateWithDeepSeekAPI(chapterId, rawChinese, glossary, groqKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[TranslateMe] Groq API failed:', message);
      const isTimeout = message.includes('aborted') || message.includes('AbortError');
      const event = new CustomEvent('translation-error', {
        detail: { message: isTimeout ? 'Groq API request timed out. Using Built-In Local Engine.' : `Groq API Error: ${message}`, provider: 'Groq API' }
      });
      window.dispatchEvent(event);
    }
  }

  return translateChapterWithSelfHealing(chapterId, rawChinese, glossary);
}

/**
 * DeepSeek-V3 Chat Completions Translation Engine with Few-Shot Reference Benchmark Injection
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

  // Internal Few-Shot Gold-Standard Reference Injection
  const referencePrompt = buildFewShotReferencePrompt(rawChinese);
  const trainingRulesPrompt = getActiveTrainingRulesPrompt();

  const systemPrompt = `You are an elite, award-winning Chinese web novel translator and literary editor specializing in Xianxia, Wuxia, Xuanhuan, Imperial Court, and Sci-Fi.
Translate the raw Chinese text into clean, high-rhythm, natural, fluent English prose.

${trainingRulesPrompt}

STRICT GLOSSARY MAPPING RULES:
You MUST strictly use the following active glossary translations for names, places, and terms:
${activeTerms || '(No specific glossary terms required)'}

${referencePrompt}

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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
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
      }),
      signal: controller.signal
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

    const promptTokens = data?.usage?.prompt_tokens || Math.ceil(rawChinese.length * 1.5);
    const completionTokens = data?.usage?.completion_tokens || Math.ceil(translatedEn.length / 4);
    StorageService.addTokenUsage(promptTokens, completionTokens);
    StorageService.recordApiCall('deepseek');
    StorageService.recordDailyApiCall('deepseek');

    return {
      translatedEn,
      selfHealedRecords: [],
      activeGlossaryCount: glossary.length
    };
  } finally {
    clearTimeout(timeoutId);
  }
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

  const referencePrompt = buildFewShotReferencePrompt(rawChinese);
  const trainingRulesPrompt = getActiveTrainingRulesPrompt();

  const prompt = `You are an elite, award-winning Chinese web novel translator and literary editor specializing in Xianxia, Wuxia, Xuanhuan, Imperial Court, and Sci-Fi.
Translate the raw Chinese text into clean, high-rhythm, natural, fluent English prose.

${trainingRulesPrompt}

STRICT GLOSSARY MAPPING RULES:
You MUST strictly use the following active glossary translations for names, places, and terms:
${activeTerms || '(No specific glossary terms required)'}

${referencePrompt}

RAW CHINESE SOURCE TEXT TO TRANSLATE:
${rawChinese}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const translatedEn = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!translatedEn) {
      throw new Error('Gemini returned an empty response.');
    }

    const promptTokens = Math.ceil(rawChinese.length * 1.5);
    const completionTokens = Math.ceil(translatedEn.length / 4);
    StorageService.addTokenUsage(promptTokens, completionTokens);
    StorageService.recordApiCall('gemini');
    StorageService.recordDailyApiCall('gemini');

    return {
      translatedEn,
      selfHealedRecords: [],
      activeGlossaryCount: glossary.length
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Ollama Local LLM Chat Completions Engine
 * Fully offline & unlimited: Runs directly against local Ollama instance (e.g. Qwen 2.5, Llama 3)
 */
async function translateWithOllamaAPI(
  _chapterId: string,
  rawChinese: string,
  glossary: GlossaryEntry[],
  endpoint: string,
  modelName: string
): Promise<TranslationResult> {
  const activeTerms = glossary
    .filter(g => rawChinese.includes(g.originalZh))
    .map(g => `- ${g.originalZh} -> ${g.translatedEn} (${g.category}${g.gender ? ', ' + g.gender : ''})`)
    .join('\n');

  const referencePrompt = buildFewShotReferencePrompt(rawChinese);
  const trainingRulesPrompt = getActiveTrainingRulesPrompt();

  const systemPrompt = `You are an elite, award-winning Chinese web novel translator and literary editor specializing in Xianxia, Wuxia, Xuanhuan, Imperial Court, and Sci-Fi.
Translate the raw Chinese text into clean, high-rhythm, natural, fluent English prose.

${trainingRulesPrompt}

STRICT GLOSSARY MAPPING RULES:
You MUST strictly use the following active glossary translations for names, places, and terms:
${activeTerms || '(No specific glossary terms required)'}

${referencePrompt}

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

  const cleanEndpoint = endpoint.replace(/\/+$/, '');
  const url = `${cleanEndpoint}/api/chat`;

  const controller = new AbortController();
  // Ollama local inference might take longer depending on hardware
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: rawChinese }
        ],
        stream: false,
        options: {
          temperature: 0.3
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      // Fallback: try OpenAI-compatible endpoint /v1/chat/completions
      const v1Url = `${cleanEndpoint}/v1/chat/completions`;
      const v1Response = await fetch(v1Url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: rawChinese }
          ],
          temperature: 0.3
        }),
        signal: controller.signal
      });

      if (!v1Response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText || 'Connection failed'}`);
      }

      const v1Data = await v1Response.json();
      const v1En = v1Data?.choices?.[0]?.message?.content || '';
      if (!v1En) throw new Error('Ollama returned an empty response.');
      
      return {
        translatedEn: v1En,
        selfHealedRecords: [],
        activeGlossaryCount: glossary.length
      };
    }

    const data = await response.json();
    const translatedEn = data?.message?.content || '';

    if (!translatedEn) {
      throw new Error('Ollama returned an empty response.');
    }

    StorageService.recordApiCall('ollama');
    StorageService.recordDailyApiCall('ollama');

    return {
      translatedEn,
      selfHealedRecords: [],
      activeGlossaryCount: glossary.length
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

