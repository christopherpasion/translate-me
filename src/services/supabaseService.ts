import { supabase } from './supabaseClient';
import { StorageService } from './storage';
import type { Novel, Chapter } from '../types';

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
        await supabase.from('novels').upsert({
          id: n.id,
          title_zh: n.titleZh,
          title_en: n.titleEn,
          author: n.author || '',
          genre: n.genre,
          cover_gradient: n.coverGradient,
          description: n.description,
          chapters_count: n.chaptersCount,
          translated_count: n.translatedCount,
          created_at: n.createdAt,
          updated_at: n.updatedAt
        });
      }

      // 2. Sync Chapters
      for (const ch of chapters) {
        await supabase.from('chapters').upsert({
          id: ch.id,
          novel_id: ch.novelId,
          chapter_number: ch.chapterNumber,
          title_zh: ch.titleZh,
          title_en: ch.titleEn,
          content_zh: ch.contentZh,
          content_en: ch.contentEn,
          status: ch.status,
          summary: ch.summary || '',
          extracted_terms_count: ch.extractedTermsCount || 0,
          self_healed_count: ch.selfHealedCount || 0,
          updated_at: ch.updatedAt
        });
      }

      // 3. Sync Glossary
      for (const g of glossary) {
        await supabase.from('glossary').upsert({
          id: g.id,
          original_zh: g.originalZh,
          translated_en: g.translatedEn,
          category: g.category,
          scope: g.scope,
          gender: g.gender || null,
          occurrences: g.occurrences || 1,
          updated_at: g.updatedAt
        });
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
   * Fetch Novels from Supabase (Fallback to localStorage)
   */
  static async fetchNovels(): Promise<Novel[]> {
    try {
      const { data, error } = await supabase.from('novels').select('*').order('updated_at', { ascending: false });
      if (error || !data || data.length === 0) return StorageService.getNovels();

      return data.map(n => ({
        id: n.id,
        titleZh: n.title_zh,
        titleEn: n.title_en,
        author: n.author,
        genre: n.genre || 'xianxia',
        coverGradient: n.cover_gradient || 'linear-gradient(135deg, #1e3a8a, #0d9488)',
        description: n.description || '',
        chaptersCount: n.chapters_count,
        translatedCount: n.translated_count,
        createdAt: n.created_at,
        updatedAt: n.updated_at
      }));
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

      return data.map(ch => ({
        id: ch.id,
        novelId: ch.novel_id,
        chapterNumber: ch.chapter_number,
        titleZh: ch.title_zh,
        titleEn: ch.title_en,
        contentZh: ch.content_zh,
        contentEn: ch.content_en,
        status: ch.status,
        summary: ch.summary,
        extractedTermsCount: ch.extracted_terms_count,
        selfHealedCount: ch.self_healed_count,
        updatedAt: ch.updated_at
      }));
    } catch {
      return StorageService.getChapters(novelId);
    }
  }
}
