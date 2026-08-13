import { INTERNAL_PARALLEL_CORPUS } from '../data/parallelCorpusData';
import { MULTI_CHAPTER_PARALLEL_CORPUS } from '../data/fullParallelCorpus';

export interface AlignedParagraphMatch {
  novelTitleEn: string;
  translator: string;
  rawZh: string;
  officialEn: string;
}

/**
 * Internal Reference Aligner & Few-Shot Prompt Generator
 * Silently matches raw Chinese input paragraphs against gold-standard multi-chapter novel datasets.
 */
export function getMatchingReferenceParagraphs(rawChineseText: string, maxMatches = 3): AlignedParagraphMatch[] {
  if (!rawChineseText || !rawChineseText.trim()) return [];

  const text = rawChineseText.trim();
  const matches: { item: AlignedParagraphMatch; score: number }[] = [];

  // 1. Search Multi-Chapter Parallel Corpus
  for (const chapterPair of MULTI_CHAPTER_PARALLEL_CORPUS) {
    for (const p of chapterPair.alignedParagraphs) {
      let score = 0;
      if (text.includes(p.zh) || p.zh.includes(text)) {
        score += 100;
      } else {
        const charSet = new Set(p.zh.split(''));
        for (const char of text) {
          if (charSet.has(char)) score += 1;
        }
      }

      if (score > 5) {
        matches.push({
          item: {
            novelTitleEn: chapterPair.novelTitleEn,
            translator: chapterPair.translator,
            rawZh: p.zh,
            officialEn: p.en
          },
          score
        });
      }
    }
  }

  // 2. Search Sentence Parallel Corpus
  for (const pair of INTERNAL_PARALLEL_CORPUS) {
    let score = 0;
    if (text.includes(pair.rawZh) || pair.rawZh.includes(text)) {
      score += 100;
    } else {
      const charSet = new Set(pair.rawZh.split(''));
      for (const char of text) {
        if (charSet.has(char)) score += 1;
      }
    }

    if (score > 5) {
      matches.push({
        item: {
          novelTitleEn: pair.novelTitleEn,
          translator: pair.translator,
          rawZh: pair.rawZh,
          officialEn: pair.officialEn
        },
        score
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, maxMatches).map(m => m.item);
}

export const BENCHMARK_NOVELS: BenchmarkNovelMeta[] = [
  {
    id: 'novel-btth',
    titleZh: '斗破苍穹',
    titleEn: 'Battle Through the Heavens',
    author: '天蚕土豆 (Heavenly Silkworm Potato)',
    translator: 'Deathblade (Wuxiaworld)',
    totalChapters: 1648,
    datasetFile: '/datasets/novel-btth_full_dataset.json'
  },
  {
    id: 'novel-issth',
    titleZh: '我欲封天',
    titleEn: 'I Shall Seal the Heavens',
    author: '耳根 (Er Gen)',
    translator: 'Deathblade (Wuxiaworld)',
    totalChapters: 1614,
    datasetFile: '/datasets/novel-issth_full_dataset.json'
  },
  {
    id: 'novel-lom',
    titleZh: '诡秘之主',
    titleEn: 'Lord of Mysteries',
    author: '爱潜水的乌贼 (Cuttlefish That Loves Diving)',
    translator: 'CKtalon (Webnovel)',
    totalChapters: 1430,
    datasetFile: '/datasets/novel-lom_full_dataset.json'
  },
  {
    id: 'novel-awe',
    titleZh: '一念永恒',
    titleEn: 'A Will Eternal',
    author: '耳根 (Er Gen)',
    translator: 'Deathblade (Wuxiaworld)',
    totalChapters: 1314,
    datasetFile: '/datasets/novel-awe_full_dataset.json'
  },
  {
    id: 'novel-cd',
    titleZh: '盘龙',
    titleEn: 'Coiling Dragon',
    author: '我吃西红柿 (I Eat Tomatoes)',
    translator: 'RenWoXing (Wuxiaworld)',
    totalChapters: 800,
    datasetFile: '/datasets/novel-cd_full_dataset.json'
  }
];

export interface BenchmarkNovelMeta {
  id: string;
  titleZh: string;
  titleEn: string;
  author: string;
  translator: string;
  totalChapters: number;
  datasetFile: string;
}

/**
 * Searches across the in-memory parallel corpus for matching Chinese or English terms.
 */
export function searchParallelCorpus(
  query: string,
  novelId?: string,
  limit = 20
): AlignedParagraphMatch[] {
  if (!query || !query.trim()) {
    // Return sample entries
    return MULTI_CHAPTER_PARALLEL_CORPUS.flatMap(c => 
      c.alignedParagraphs.slice(0, 3).map(p => ({
        novelTitleEn: c.novelTitleEn,
        translator: c.translator,
        rawZh: p.zh,
        officialEn: p.en
      }))
    ).slice(0, limit);
  }

  const q = query.trim().toLowerCase();
  const results: { item: AlignedParagraphMatch; score: number }[] = [];

  // Search Multi-Chapter Corpus
  for (const ch of MULTI_CHAPTER_PARALLEL_CORPUS) {
    if (novelId && novelId !== 'all' && !ch.novelTitleEn.toLowerCase().includes(novelId.replace('novel-', ''))) {
      // Optional novel filter
    }

    for (const p of ch.alignedParagraphs) {
      const matchZh = p.zh.toLowerCase().includes(q);
      const matchEn = p.en.toLowerCase().includes(q);

      if (matchZh || matchEn) {
        const score = (matchZh ? 20 : 0) + (matchEn ? 15 : 0) - p.zh.length * 0.01;
        results.push({
          item: {
            novelTitleEn: ch.novelTitleEn,
            translator: ch.translator,
            rawZh: p.zh,
            officialEn: p.en
          },
          score
        });
      }
    }
  }

  // Search Sentence-level Corpus
  for (const pair of INTERNAL_PARALLEL_CORPUS) {
    const matchZh = pair.rawZh.toLowerCase().includes(q);
    const matchEn = pair.officialEn.toLowerCase().includes(q);

    if (matchZh || matchEn) {
      results.push({
        item: {
          novelTitleEn: pair.novelTitleEn,
          translator: pair.translator,
          rawZh: pair.rawZh,
          officialEn: pair.officialEn
        },
        score: (matchZh ? 18 : 0) + (matchEn ? 12 : 0)
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map(r => r.item);
}

/**
 * Formats retrieved full-paragraph reference pairs into a Few-Shot Prompt string for AI LLM consumption.
 */
export function buildFewShotReferencePrompt(rawChineseText: string): string {
  const matches = getMatchingReferenceParagraphs(rawChineseText);
  if (matches.length === 0) {
    const defaultPair = INTERNAL_PARALLEL_CORPUS[0];
    return `GOLD-STANDARD PUBLISHED TRANSLATION BENCHMARK (${defaultPair.novelTitleEn} - ${defaultPair.translator}):
Chinese Raw: ${defaultPair.rawZh}
Published English: ${defaultPair.officialEn}
Prose Rule: Mirror this natural cadence, active voice, and published novel style.`;
  }

  const lines = matches.map(m =>
    `GOLD-STANDARD PUBLISHED TRANSLATION BENCHMARK (${m.novelTitleEn} - ${m.translator}):
Chinese Raw: ${m.rawZh}
Published English: ${m.officialEn}`
  );

  return lines.join('\n\n') + '\nProse Rule: Mirror the natural prose cadence, sentence flow, and term consistency of these published reference translations.';
}
