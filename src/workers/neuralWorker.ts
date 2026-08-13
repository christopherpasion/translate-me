import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for optimal browser execution
env.allowLocalModels = false;
env.useBrowserCache = true;

// Define translation pipeline instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let translatorInstance: any = null;
let isInitializing = false;

interface WorkerMessage {
  type: 'INIT' | 'TRANSLATE' | 'TRANSLATE_BATCH';
  id?: string;
  payload?: {
    text?: string;
    texts?: string[];
  };
}

async function getTranslator(onProgress?: (progressData: unknown) => void) {
  if (translatorInstance) {
    return translatorInstance;
  }

  if (isInitializing) {
    // Wait for existing initialization to finish
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return translatorInstance;
  }

  isInitializing = true;

  try {
    translatorInstance = await pipeline('translation', 'Xenova/opus-mt-zh-en', {
      quantized: true,
      progress_callback: (p: unknown) => {
        if (onProgress) onProgress(p);
        self.postMessage({ type: 'DOWNLOAD_PROGRESS', data: p });
      }
    });
    return translatorInstance;
  } finally {
    isInitializing = false;
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, id, payload } = e.data;

  try {
    if (type === 'INIT') {
      await getTranslator((p) => {
        self.postMessage({ type: 'DOWNLOAD_PROGRESS', id, data: p });
      });
      self.postMessage({ type: 'INIT_SUCCESS', id });
    } else if (type === 'TRANSLATE') {
      const translator = await getTranslator();
      const text = payload?.text || '';
      
      if (!text.trim()) {
        self.postMessage({ type: 'TRANSLATE_SUCCESS', id, result: '' });
        return;
      }

      const output = await translator(text, {
        max_length: 512,
        num_beams: 2,
        temperature: 0.7
      });

      const translatedText = Array.isArray(output) && output[0]?.translation_text
        ? output[0].translation_text
        : typeof output === 'string'
          ? output
          : '';

      self.postMessage({ type: 'TRANSLATE_SUCCESS', id, result: translatedText });
    } else if (type === 'TRANSLATE_BATCH') {
      const translator = await getTranslator();
      const texts = payload?.texts || [];
      const results: string[] = [];

      for (let i = 0; i < texts.length; i++) {
        const item = texts[i];
        if (!item.trim()) {
          results.push('');
          continue;
        }

        const output = await translator(item, {
          max_length: 512,
          num_beams: 1, // Faster single-beam for fast batch throughput
          temperature: 0.7
        });

        const translated = Array.isArray(output) && output[0]?.translation_text
          ? output[0].translation_text
          : typeof output === 'string'
            ? output
            : '';

        results.push(translated);

        self.postMessage({
          type: 'BATCH_PROGRESS',
          id,
          current: i + 1,
          total: texts.length,
          progress: Math.round(((i + 1) / texts.length) * 100)
        });
      }

      self.postMessage({ type: 'TRANSLATE_BATCH_SUCCESS', id, results });
    }
  } catch (err) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: err instanceof Error ? err.message : String(err)
    });
  }
};
