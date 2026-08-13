import type { GlossaryEntry } from '../types';
import { simulateLLMTranslationDraft } from './translationEngine';

export interface ModelDownloadProgress {
  status: 'init' | 'downloading' | 'loading' | 'ready' | 'error';
  progress?: number;
  file?: string;
  loaded?: number;
  total?: number;
  message?: string;
}

type ProgressListener = (progress: ModelDownloadProgress) => void;

class CustomNeuralTranslatorService {
  private worker: Worker | null = null;
  private isReady = false;
  private isInitializing = false;
  private listeners: Set<ProgressListener> = new Set();
  private currentProgress: ModelDownloadProgress = { status: 'init', message: 'Neural AI not yet loaded' };

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL('../workers/neuralWorker.ts', import.meta.url), {
        type: 'module'
      });

      this.worker.onmessage = (e) => {
        const { type, data, current, total, progress, result, results, error, id } = e.data;

        if (type === 'DOWNLOAD_PROGRESS') {
          if (data && typeof data === 'object') {
            const p = data as { status?: string; progress?: number; file?: string; loaded?: number; total?: number };
            this.currentProgress = {
              status: p.status === 'done' ? 'loading' : 'downloading',
              progress: typeof p.progress === 'number' ? Math.round(p.progress) : undefined,
              file: p.file,
              loaded: p.loaded,
              total: p.total,
              message: p.file ? `Downloading ${p.file} (${p.progress ? Math.round(p.progress) : 0}%)` : 'Preparing neural weights...'
            };
            this.notifyListeners();
          }
        } else if (type === 'INIT_SUCCESS') {
          this.isReady = true;
          this.isInitializing = false;
          this.currentProgress = {
            status: 'ready',
            progress: 100,
            message: 'Translate-Me Neural Core Ready'
          };
          this.notifyListeners();
        } else if (type === 'BATCH_PROGRESS') {
          this.currentProgress = {
            status: 'loading',
            progress,
            message: `Translating sentence ${current} of ${total}...`
          };
          this.notifyListeners();
        } else if (type === 'ERROR') {
          console.error('[Neural Translator Worker Error]:', error);
          this.isInitializing = false;
          this.currentProgress = {
            status: 'error',
            message: `Worker Error: ${error}`
          };
          this.notifyListeners();
        }

        // Dispatch to waiting promises
        if (id && this.pendingRequests.has(id)) {
          const req = this.pendingRequests.get(id)!;
          if (type === 'TRANSLATE_SUCCESS') {
            req.resolve(result);
            this.pendingRequests.delete(id);
          } else if (type === 'TRANSLATE_BATCH_SUCCESS') {
            req.resolve(results);
            this.pendingRequests.delete(id);
          } else if (type === 'INIT_SUCCESS') {
            req.resolve(true);
            this.pendingRequests.delete(id);
          } else if (type === 'ERROR') {
            req.reject(new Error(error));
            this.pendingRequests.delete(id);
          }
        }
      };

      this.worker.onerror = (err) => {
        console.error('[Neural Translator Worker Fatal]:', err);
        this.isInitializing = false;
        this.currentProgress = {
          status: 'error',
          message: 'Worker failed to initialize'
        };
        this.notifyListeners();
      };
    }

    return this.worker;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();

  public subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    listener(this.currentProgress);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentProgress);
    }
  }

  public getStatus(): ModelDownloadProgress {
    return this.currentProgress;
  }

  public isModelReady(): boolean {
    return this.isReady;
  }

  public async preloadModel(onProgress?: ProgressListener): Promise<boolean> {
    if (this.isReady) return true;
    if (onProgress) {
      this.subscribe(onProgress);
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return this.isReady;
    }

    this.isInitializing = true;
    this.currentProgress = { status: 'downloading', message: 'Initializing Neural Transformer...' };
    this.notifyListeners();

    return new Promise<boolean>((resolve, reject) => {
      const id = 'init_' + Math.random().toString(36).substring(2, 9);
      this.pendingRequests.set(id, { resolve, reject });
      const worker = this.getWorker();
      worker.postMessage({ type: 'INIT', id });
    });
  }

  /**
   * Translates a chapter using our In-House Seq2Seq Neural AI with glossary constraint resolution.
   */
  public async translateChapter(
    _chapterId: string,
    rawZh: string,
    glossary: GlossaryEntry[],
    onStepProgress?: (step: string, percent: number) => void
  ): Promise<string> {
    try {
      if (onStepProgress) onStepProgress('🧠 Loading Translate-Me Neural Network...', 15);

      // Ensure model is initialized
      if (!this.isReady) {
        await this.preloadModel((p) => {
          if (onStepProgress && p.progress) {
            onStepProgress(`🧠 Loading AI Weights: ${p.message || ''}`, Math.min(60, 15 + Math.round(p.progress * 0.45)));
          }
        });
      }

      if (onStepProgress) onStepProgress('🔍 Injecting Glossary Constraints...', 65);

      // Split raw chapter into paragraphs
      const paragraphs = rawZh
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (paragraphs.length === 0) return '';

      // Prepare glossary map for post-processing alignment
      const activeGlossaryMap = new Map<string, string>();
      for (const entry of glossary) {
        if (entry.originalZh && entry.translatedEn) {
          activeGlossaryMap.set(entry.originalZh, entry.translatedEn);
        }
      }

      if (onStepProgress) onStepProgress('⚡ Generating Neural Translations in Background Worker...', 70);

      const worker = this.getWorker();
      const id = 'batch_' + Math.random().toString(36).substring(2, 9);

      const translatedParagraphs = await new Promise<string[]>((resolve, reject) => {
        this.pendingRequests.set(id, { resolve, reject });
        worker.postMessage({
          type: 'TRANSLATE_BATCH',
          id,
          payload: { texts: paragraphs }
        });
      });

      if (onStepProgress) onStepProgress('✨ Polishing Xianxia Prose & Restoring Entities...', 92);

      // Post-process translated paragraphs with glossary alignment and punctuation cleanup
      const finalized = translatedParagraphs.map((para) => {
        let clean = para.trim();

        // Ensure proper dialogue quotes formatting
        clean = clean
          .replace(/“/g, '"')
          .replace(/”/g, '"')
          .replace(/‘/g, "'")
          .replace(/’/g, "'");

        // Enforce glossary terms if any raw terms remained
        for (const [zh, en] of activeGlossaryMap.entries()) {
          if (clean.includes(zh)) {
            clean = clean.split(zh).join(en);
          }
        }

        // Capitalize first character of sentences
        if (clean.length > 0) {
          clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        }

        return clean;
      });

      if (onStepProgress) onStepProgress('✨ Neural AI Translation Complete!', 100);

      return finalized.join('\n\n');
    } catch (err) {
      console.warn('[Custom Neural Translator Fallback]: Neural worker failed, falling back to enhanced dictionary engine', err);
      if (onStepProgress) onStepProgress('⚡ Fallback: Translating with Enhanced Dictionary Engine...', 80);
      return simulateLLMTranslationDraft(rawZh, glossary);
    }
  }
}

export const customNeuralTranslator = new CustomNeuralTranslatorService();
