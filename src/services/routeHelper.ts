import type { Novel } from '../types';

/**
 * Convert any string into a clean, URL-safe slug
 * Example: "Daily Life of Imperial Examinations " -> "daily-life-of-imperial-examinations"
 */
export const slugify = (text: string): string => {
  if (!text) return 'novel';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[’']/g, '') // remove apostrophes so "pei's" becomes "peis"
    .replace(/[^a-z0-9]+/g, '-') // convert non-alphanumeric to hyphens
    .replace(/^-+|-+$/g, '') // strip leading/trailing hyphens
    || 'novel';
};

/**
 * Match a novel from a URL slug or ID
 */
export const findNovelBySlug = (novels: Novel[], slug: string): Novel | undefined => {
  if (!slug || novels.length === 0) return undefined;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct ID match
  const byId = novels.find(n => n.id === cleanSlug);
  if (byId) return byId;

  // 2. Exact slug match on titleEn
  const bySlug = novels.find(n => slugify(n.titleEn) === cleanSlug);
  if (bySlug) return bySlug;

  // 3. Fallback partial / contains match
  return novels.find(n => {
    const s = slugify(n.titleEn);
    return s.includes(cleanSlug) || cleanSlug.includes(s);
  });
};

/**
 * Build URL path for reading a specific novel and chapter
 * Example: /novel/daily-life-of-imperial-examinations/chapter-1
 */
export const buildChapterUrl = (novel: Novel, chapterNumber: number): string => {
  const novelSlug = slugify(novel.titleEn || novel.titleZh || novel.id);
  return `/novel/${novelSlug}/chapter-${chapterNumber}`;
};

/**
 * Build URL path for novel homepage / overview
 * Example: /novel/daily-life-of-imperial-examinations
 */
export const buildNovelUrl = (novel: Novel): string => {
  const novelSlug = slugify(novel.titleEn || novel.titleZh || novel.id);
  return `/novel/${novelSlug}`;
};

/**
 * Build URL path for Studio / Admin Mode
 * Example: /studio/daily-life-of-imperial-examinations
 */
export const buildStudioUrl = (novel?: Novel | null): string => {
  if (!novel) return '/studio';
  const novelSlug = slugify(novel.titleEn || novel.titleZh || novel.id);
  return `/studio/${novelSlug}`;
};

export interface ParsedRoute {
  viewMode: 'home' | 'reader' | 'admin';
  novelSlug?: string;
  chapterNumber?: number;
}

/**
 * Parse the current browser pathname & search parameters
 */
export const parseCurrentRoute = (pathname: string, search: string): ParsedRoute => {
  const params = new URLSearchParams(search);

  // 1. Check path-based routes: /novel/:slug/chapter-:num
  const chapterMatch = pathname.match(/^\/novel\/([^/]+)\/chapter-(\d+)/i);
  if (chapterMatch) {
    return {
      viewMode: 'reader',
      novelSlug: chapterMatch[1],
      chapterNumber: parseInt(chapterMatch[2], 10)
    };
  }

  // 2. Path-based novel route: /novel/:slug
  const novelMatch = pathname.match(/^\/novel\/([^/]+)/i);
  if (novelMatch) {
    return {
      viewMode: 'reader',
      novelSlug: novelMatch[1]
    };
  }

  // 3. Path-based studio route: /studio/:slug or /studio
  const studioMatch = pathname.match(/^\/studio(?:\/([^/]+))?/i);
  if (studioMatch) {
    return {
      viewMode: 'admin',
      novelSlug: studioMatch[1]
    };
  }

  // 4. Legacy query parameter fallback: ?novel=...&chapter=... or ?view=...
  const queryNovel = params.get('novel');
  const queryChap = params.get('chapter');
  const queryView = params.get('view');

  if (queryNovel || queryChap || queryView === 'reader') {
    return {
      viewMode: 'reader',
      novelSlug: queryNovel || undefined,
      chapterNumber: queryChap ? parseInt(queryChap, 10) : undefined
    };
  }

  if (queryView === 'admin') {
    return {
      viewMode: 'admin',
      novelSlug: queryNovel || undefined
    };
  }

  return {
    viewMode: 'home'
  };
};
