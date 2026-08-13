import type { Chapter } from '../types';
import { StorageService } from './storage';
import { SupabaseService } from './supabaseService';

export interface BulkChapterPackage {
  novelId: string;
  novelTitleZh: string;
  novelTitleEn: string;
  author?: string;
  genre: string;
  totalChapters?: number;
  chapters: {
    chapterNumber: number;
    titleZh: string;
    titleEn: string;
    contentZh: string;
    contentEn: string;
  }[];
}

export class BulkDatasetLoader {
  /**
   * Fetch and load a full multi-thousand chapter dataset from server/public storage
   */
  static async loadFullNovelDataset(novelId: string): Promise<{ success: boolean; importedCount: number; message: string }> {
    try {
      const url = `/datasets/${novelId}_full_dataset.json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} when fetching ${url}`);
      }
      const data: BulkChapterPackage = await response.json();
      return await this.importBulkChapterPackage(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[BulkDatasetLoader] Failed to load dataset ${novelId}:`, msg);
      return { success: false, importedCount: 0, message: `Dataset error: ${msg}` };
    }
  }

  /**
   * Import and index a bulk chapter package (supporting thousands of full chapters)
   */
  static async importBulkChapterPackage(pkg: BulkChapterPackage): Promise<{ success: boolean; importedCount: number; message: string }> {
    if (!pkg || !pkg.chapters || pkg.chapters.length === 0) {
      return { success: false, importedCount: 0, message: 'Invalid or empty bulk chapter package.' };
    }

    let count = 0;
    for (const item of pkg.chapters) {
      const chapterId = `chap-${pkg.novelId}-${item.chapterNumber}`;
      const chapterObj: Chapter = {
        id: chapterId,
        novelId: pkg.novelId,
        chapterNumber: item.chapterNumber,
        titleZh: item.titleZh,
        titleEn: item.titleEn,
        contentZh: item.contentZh,
        contentEn: item.contentEn,
        status: item.contentEn.trim() ? 'translated' : 'raw',
        extractedTermsCount: 0,
        selfHealedCount: 0,
        updatedAt: new Date().toISOString()
      };

      StorageService.saveChapter(chapterObj);
      count++;
    }

    try {
      await SupabaseService.syncAllLocalToCloud(pkg.novelId);
    } catch (e) {
      console.log('[BulkDatasetLoader] Local import succeeded; Cloud sync skipped.', e);
    }

    return {
      success: true,
      importedCount: count,
      message: `Successfully imported ${count} full chapters for "${pkg.novelTitleEn}".`
    };
  }

  /**
   * Parse raw JSON bulk string containing thousands of chapters
   */
  static parseBulkJson(jsonStr: string): BulkChapterPackage | null {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && Array.isArray(parsed.chapters)) {
        return parsed as BulkChapterPackage;
      }
      return null;
    } catch (err) {
      console.error('[BulkDatasetLoader] JSON parse error:', err);
      return null;
    }
  }
}
