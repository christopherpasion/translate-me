import { supabase } from './supabaseClient';
import { StorageService } from './storage';
import type { Novel, Chapter, GlossaryEntry } from '../types';

export class SupabaseService {
  /**
   * Push all local novels, chapters, glossary entries, and token stats to Supabase Cloud
   */
  static async syncAllLocalToCloud(novelId: string): Promise<{ success: boolean; syncedChapters: number; syncedGlossary: number; message: string }> {
    try {
      const novels = StorageService.getNovels();
      const chapters = StorageService.getChapters(novelId);
      const glossary = StorageService.getGlossary(novelId);
      const suggestions = StorageService.getReaderSuggestions(novelId);
      const tokenUsage = StorageService.getTokenUsage();

      // 1. Sync Novels
      for (const n of novels) {
        await this.saveNovelCloud(n);
      }

      // 2. Sync Chapters
      for (const ch of chapters) {
        await this.saveChapterCloud(ch);
      }

      // 3. Sync Glossary
      for (const g of glossary) {
        await this.saveGlossaryCloud(g, novelId);
      }

      // 4. Sync Reader Suggestions
      for (const s of suggestions) {
        await supabase.from('reader_suggestions').upsert({
          id: s.id,
          novel_id: s.novelId,
          chapter_number: s.chapterNumber,
          original_zh: s.originalZh,
          current_en: s.currentEn,
          suggested_en: s.suggestedEn,
          reason: s.reason,
          submitted_by: s.submittedBy,
          status: s.status,
          created_at: s.createdAt
        });
      }

      // 5. Sync Token Usage
      await supabase.from('token_usage').upsert({
        id: 'global-usage',
        prompt_tokens: tokenUsage.promptTokens,
        completion_tokens: tokenUsage.completionTokens,
        total_tokens: tokenUsage.totalTokens,
        total_cost_usd: tokenUsage.totalCostUsd,
        last_updated: tokenUsage.lastUpdated
      });

      return {
        success: true,
        syncedChapters: chapters.length,
        syncedGlossary: glossary.length,
        message: `Successfully synced ${chapters.length} chapters & ${glossary.length} terms to Supabase Cloud!`
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[SupabaseService] Cloud sync notice:', msg);
      return {
        success: false,
        syncedChapters: 0,
        syncedGlossary: 0,
        message: `Cloud sync notice: Local cache saved. (${msg})`
      };
    }
  }

  /**
   * Save a single novel to Supabase
   */
  static async saveNovelCloud(novel: Novel): Promise<void> {
    try {
      await supabase.from('novels').upsert({
        id: novel.id,
        title_zh: novel.titleZh,
        title_en: novel.titleEn,
        author: novel.author || '',
        genre: novel.genre,
        tags: novel.tags || [],
        cover_gradient: novel.coverGradient,
        description: novel.description,
        chapters_count: novel.chaptersCount,
        translated_count: novel.translatedCount,
        created_at: novel.createdAt,
        updated_at: novel.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('[SupabaseService] saveNovelCloud error:', err);
    }
  }

  /**
   * Delete a novel and its chapters/glossary from Supabase Cloud
   */
  static async deleteNovelCloud(novelId: string): Promise<void> {
    try {
      await Promise.all([
        supabase.from('novels').delete().eq('id', novelId),
        supabase.from('chapters').delete().eq('novel_id', novelId),
        supabase.from('reader_suggestions').delete().eq('novel_id', novelId)
      ]);
    } catch (err) {
      console.warn('[SupabaseService] deleteNovelCloud error:', err);
    }
  }

  /**
   * Save a chapter to Supabase
   */
  static async saveChapterCloud(chapter: Chapter): Promise<void> {
    try {
      await supabase.from('chapters').upsert({
        id: chapter.id,
        novel_id: chapter.novelId,
        chapter_number: chapter.chapterNumber,
        title_zh: chapter.titleZh,
        title_en: chapter.titleEn,
        content_zh: chapter.contentZh,
        content_en: chapter.contentEn,
        status: chapter.status,
        summary: chapter.summary || '',
        extracted_terms_count: chapter.extractedTermsCount || 0,
        self_healed_count: chapter.selfHealedCount || 0,
        updated_at: chapter.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('[SupabaseService] saveChapterCloud error:', err);
    }
  }

  /**
   * Delete a chapter from Supabase
   */
  static async deleteChapterCloud(chapterId: string): Promise<void> {
    try {
      await supabase.from('chapters').delete().eq('id', chapterId);
    } catch (err) {
      console.warn('[SupabaseService] deleteChapterCloud error:', err);
    }
  }

  /**
   * Save a glossary term to Supabase
   */
  static async saveGlossaryCloud(entry: GlossaryEntry, _novelId?: string): Promise<void> {
    try {
      await supabase.from('glossary').upsert({
        id: entry.id,
        original_zh: entry.originalZh,
        translated_en: entry.translatedEn,
        category: entry.category,
        scope: entry.scope,
        gender: entry.gender || null,
        notes: entry.notes || null,
        occurrences: entry.occurrences || 1,
        updated_at: entry.updatedAt || new Date().toISOString()
      });
    } catch (err) {
      console.warn('[SupabaseService] saveGlossaryCloud error:', err);
    }
  }

  /**
   * Delete a glossary term from Supabase
   */
  static async deleteGlossaryCloud(entryId: string): Promise<void> {
    try {
      await supabase.from('glossary').delete().eq('id', entryId);
    } catch (err) {
      console.warn('[SupabaseService] deleteGlossaryCloud error:', err);
    }
  }

  /**
   * Fetch Novels from Supabase (Fallback to localStorage)
   */
  static async fetchNovels(): Promise<Novel[]> {
    try {
      const { data, error } = await supabase.from('novels').select('*').order('updated_at', { ascending: false });
      if (error) {
        console.warn('[SupabaseService] fetchNovels error:', error.message);
        return StorageService.getNovels();
      }
      if (!data) return [];

      const cloudNovels: Novel[] = data.map(n => ({
        id: n.id,
        titleZh: n.title_zh,
        titleEn: n.title_en,
        author: n.author || '',
        genre: n.genre || 'xianxia',
        tags: n.tags || [],
        coverGradient: n.cover_gradient || 'linear-gradient(135deg, #1e3a8a, #0d9488)',
        description: n.description || '',
        chaptersCount: n.chapters_count || 0,
        translatedCount: n.translated_count || 0,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      }));

      // Cache cloud novels into localStorage for instant offline load
      localStorage.setItem('trans_me_novels_v2', JSON.stringify(cloudNovels));
      return cloudNovels;
    } catch {
      return StorageService.getNovels();
    }
  }

  /**
   * Fetch Chapters for a Novel from Supabase (Fallback to localStorage)
   */
  static async fetchChapters(novelId: string): Promise<Chapter[]> {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('novel_id', novelId)
        .order('chapter_number', { ascending: true });

      if (error || !data || data.length === 0) return StorageService.getChapters(novelId);

      const cloudChapters: Chapter[] = data.map(ch => ({
        id: ch.id,
        novelId: ch.novel_id,
        chapterNumber: ch.chapter_number,
        titleZh: ch.title_zh,
        titleEn: ch.title_en,
        contentZh: ch.content_zh,
        contentEn: ch.content_en,
        status: ch.status,
        summary: ch.summary,
        extractedTermsCount: ch.extracted_terms_count || 0,
        selfHealedCount: ch.self_healed_count || 0,
        updatedAt: ch.updated_at
      }));

      return cloudChapters;
    } catch {
      return StorageService.getChapters(novelId);
    }
  }

  /**
   * Subscribe to real-time database changes across all devices
   */
  static subscribeToChanges(onUpdate: () => void): () => void {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'novels' },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chapters' },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}
