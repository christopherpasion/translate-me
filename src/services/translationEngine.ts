import { StorageService } from './storage';
import { getPinyinForText } from './pinyinService';

/**
 * Rule #3 Compliance: Automatically translates Chinese chapter titles into clean English titles
 * so no Chinese characters remain in English title badges or dropdowns.
 * e.g., "第一章 陨落的天才" -> "Chapter 1: The Fallen Genius"
 *       "读书" -> "Reading / Indominus Dragon (1)"
 */
export function cleanAndTranslateChapterTitle(titleZh: string, chapterNumber?: number): string {
  if (!titleZh || !titleZh.trim()) {
    return chapterNumber ? `Chapter ${chapterNumber}` : 'Untitled Chapter';
  }

  const trimmed = titleZh.trim();

  // Known seed chapter title mappings
  const knownTitleMap: Record<string, string> = {
    '第一章 陨落的天才': 'Chapter 1: The Fallen Genius',
    '第二章 斗气大陆': 'Chapter 2: The Dou Qi Continent',
    '第三章 药老': 'Chapter 3: Yao Lao',
    '第一章 诡秘之主': 'Chapter 1: Lord of Mysteries',
    '第二章 塔罗会': 'Chapter 2: The Tarot Club',
    '第一章 一念永恒': 'Chapter 1: A Will Eternal',
    '读书': 'Reading / Indominus Dragon (1)',
  };

  if (knownTitleMap[trimmed]) {
    return knownTitleMap[trimmed];
  }

  // Regex pattern for standard Chinese chapter titles (e.g. 第一千二百三十四章 标题)
  let cleanTitle = trimmed
    .replace(/^第([0-9一二三四五六七八九十百千万]+)章\s*/, (_, numStr) => {
      const parsedNum = parseChineseNumber(numStr) || chapterNumber || 1;
      return `Chapter ${parsedNum}: `;
    });

  // Common title words translation
  const wordMap: [string, string][] = [
    ['陨落的天才', 'The Fallen Genius'],
    ['斗气大陆', 'The Dou Qi Continent'],
    ['诡秘之主', 'Lord of Mysteries'],
    ['塔罗会', 'The Tarot Club'],
    ['一念永恒', 'A Will Eternal'],
    ['读书', 'Reading'],
    ['破壳', 'Hatching'],
    ['重生', 'Rebirth'],
    ['无敌', 'Invincible'],
    ['崛起', 'Rise of Power'],
    ['天才', 'Genius'],
    ['废物', 'The Fallen One'],
  ];

  for (const [zh, en] of wordMap) {
    cleanTitle = cleanTitle.replaceAll(zh, en);
  }

  // If Chinese characters still remain, strip them and append Pinyin / Chapter fallback
  if (/[\u4e00-\u9fa5]/.test(cleanTitle)) {
    const pinyin = getPinyinForText(cleanTitle);
    const nonZhPart = cleanTitle.replace(/[\u4e00-\u9fa5]+/g, '').trim();
    if (nonZhPart) {
      return `${nonZhPart} (${pinyin})`;
    }
    return chapterNumber ? `Chapter ${chapterNumber}: ${pinyin}` : pinyin;
  }

  return cleanTitle.trim();
}

function parseChineseNumber(str: string): number {
  const digits: Record<string, number> = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
  };
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  if (digits[str]) return digits[str];
  return 1;
}

/**
 * Global Cascade Re-alignment
 * Updates a term across all chapter drafts in a novel while strictly respecting word boundaries (Rule #2).
 */
export function cascadeTermReplacement(
  novelId: string,
  termZh: string,
  oldEn: string,
  newEn: string
): number {
  const chapters = StorageService.getChapters(novelId);
  let updatedChaptersCount = 0;
  const drifts = getPossibleDrifts(termZh, newEn, oldEn);

  for (const chapter of chapters) {
    if (!chapter.contentEn) continue;

    let contentEn = chapter.contentEn;
    let healedInChap = 0;

    for (const drift of drifts) {
      if (!drift || drift === newEn) continue;
      const regex = new RegExp(`\\b${escapeRegExp(drift)}\\b`, 'gi');

      if (regex.test(contentEn)) {
        contentEn = contentEn.replace(regex, (match: string) => {
          healedInChap++;
          if (match === match.toLowerCase()) {
            return newEn.toLowerCase();
          }
          if (match === match.toUpperCase()) {
            return newEn.toUpperCase();
          }
          return newEn;
        });

        StorageService.addHealingRecord({
          id: 'cascade-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          chapterId: chapter.id,
          originalDraftText: drift,
          autoHealedText: newEn,
          termZh,
          incorrectEn: drift,
          correctedEn: newEn,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (healedInChap > 0) {
      chapter.contentEn = contentEn;
      chapter.selfHealedCount = (chapter.selfHealedCount || 0) + healedInChap;
      chapter.updatedAt = new Date().toISOString();
      StorageService.saveChapter(chapter);
      updatedChaptersCount++;
    }
  }

  return updatedChaptersCount;
}

/**
 * Rule #2 & Rule #3 Compliance: Eradicates any leftover Chinese characters from English translation output,
 * replacing them with clean Pinyin transliterated equivalents.
 */
export function cleanUnwantedChineseFromEnglish(text: string): string {
  if (!text) return '';
  if (!/[\u4e00-\u9fa5]/.test(text)) return text;

  return text.replace(/[\u4e00-\u9fa5]+/g, (match) => {
    const pinyin = getPinyinForText(match);
    const cleanPinyin = pinyin
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u4e00-\u9fa5]+/g, '')
      .trim();
    return cleanPinyin ? ` ${cleanPinyin} ` : '';
  }).replace(/\s+/g, ' ').trim();
}

function getPossibleDrifts(originalZh: string, correctEn: string, oldEn?: string): string[] {
  const drifts = new Set<string>();

  if (oldEn && oldEn !== correctEn) {
    drifts.add(oldEn);
    drifts.add(oldEn.toLowerCase());
    drifts.add(oldEn.charAt(0).toUpperCase() + oldEn.slice(1));
  }

  if (correctEn) {
    drifts.add(correctEn.toLowerCase());
    drifts.add(correctEn.charAt(0).toUpperCase() + correctEn.slice(1));
  }

  if (originalZh === '萧炎') {
    drifts.add('Little Flame');
    drifts.add('Xiao Flame');
  } else if (originalZh === '云岚宗') {
    drifts.add('Cloud Mist Sect');
    drifts.add('Mist Cloud Sect');
  }

  drifts.delete(correctEn);
  return Array.from(drifts);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
