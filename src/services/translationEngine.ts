import type { GlossaryEntry, SelfHealingRecord } from '../types';
import { StorageService } from './storage';
import { getPinyinForText } from './pinyinService';
import { EXTENDED_DICTIONARY_DATA } from '../data/chineseDictionaryData';

export type TranslationStyle = 'xianxia' | 'fluent' | 'faithful';

export interface TranslationResult {
  translatedEn: string;
  selfHealedRecords: SelfHealingRecord[];
  activeGlossaryCount: number;
}

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
 * Multi-pass Context-Aware Translation Engine
 * 1. Context Injection: Injects active 2-tier glossary (Local & Global) into translation pass
 * 2. Self-Healing Pass: Verifies draft against glossary, auto-correcting term drifts (e.g. "Little Flame" -> "Xiao Yan")
 * 3. Cascade Alignment: Allows editing a term to trigger instant global replacement across all chapters
 */
export function translateChapterWithSelfHealing(
  chapterId: string,
  rawChinese: string,
  glossary: GlossaryEntry[]
): TranslationResult {
  const healingRecords: SelfHealingRecord[] = [];
  
  // Sort glossary entries by length descending to match multi-word phrases before individual characters
  const sortedGlossary = [...glossary].sort((a, b) => b.originalZh.length - a.originalZh.length);

  // Active glossary entries present in this text
  const activeEntries = sortedGlossary.filter(g => rawChinese.includes(g.originalZh));

  // Step 1: Base Draft Translation
  let draftText = simulateLLMTranslationDraft(rawChinese, activeEntries);

  // Step 2: Self-Healing Pass (Rule #2 word-boundary enforcement)
  for (const entry of activeEntries) {
    const { originalZh, translatedEn } = entry;
    const commonDrifts = getPossibleDrifts(originalZh, translatedEn);
    
    for (const drift of commonDrifts) {
      const regex = new RegExp(`\\b${escapeRegExp(drift)}\\b`, 'gi');
      if (regex.test(draftText)) {
        draftText = draftText.replace(regex, translatedEn);

        const record: SelfHealingRecord = {
          id: 'heal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          chapterId,
          originalDraftText: drift,
          autoHealedText: translatedEn,
          termZh: originalZh,
          incorrectEn: drift,
          correctedEn: translatedEn,
          timestamp: new Date().toISOString()
        };
        healingRecords.push(record);
        StorageService.addHealingRecord(record);
      }
    }
  }

  return {
    translatedEn: draftText,
    selfHealedRecords: healingRecords,
    activeGlossaryCount: activeEntries.length
  };
}

/**
 * Global Cascade Re-alignment
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

// Core Web Novel & Classical Vocabulary Lexicon for In-Browser Offline Translation
const COMMON_WEBNOVEL_LEXICON: [string, string][] = [
  // Idioms & Common Multi-character Phrases
  ['三十年河东，三十年河西', 'Thirty years east of the river, thirty years west of the river'],
  ['莫欺少年穷', 'do not look down on a young man for being poor'],
  ['倒吸一口凉气', 'gasped in cold air'],
  ['人头涌动', 'surging crowd of people'],
  ['不出所料', 'as expected'],
  ['原地踏步', 'standing still at the same spot'],
  ['面无表情', 'expressionless face'],
  ['自嘲与不屈', 'self-mockery and unyielding determination'],
  ['清冷脱俗', 'refined and ethereal'],
  ['钻心的疼痛', 'piercing pain in the heart'],
  ['重重的砸在心口', 'heavily pounding on the chest'],
  ['清泉般的娇柔声音', 'gentle voice like a clear spring'],
  ['测验魔石碑', 'Testing Magic Stone Tablet'],
  ['斗之力', 'Dou Zhi Qi'],
  ['斗气大陆', 'Dou Qi Continent'],
  ['低级', 'Low grade'],
  ['中级', 'Middle grade'],
  ['高级', 'High grade'],
  ['巅峰', 'Peak'],
  ['大圆满', 'Great Perfection'],
  
  // Dialogue Tags & Speech
  ['冷笑道', 'sneered, saying'],
  ['冷笑', 'sneered'],
  ['沉声道', 'said in a deep voice'],
  ['怒喝道', 'shouted in fury'],
  ['怒吼', 'roared'],
  ['大喝', 'yelled loudly'],
  ['低语', 'whispered'],
  ['喃喃道', 'murmured'],
  ['轻叹道', 'sighed softly'],
  ['叹息', 'sighed'],
  ['苦笑道', 'smiled wryly, saying'],
  ['苦笑', 'smiled bitterly'],
  ['微笑道', 'smiled, saying'],
  ['冷哼道', 'snorted coldly, saying'],
  ['冷哼', 'snorted coldly'],
  ['问道', 'asked'],
  ['回答道', 'replied'],
  ['说道', 'said'],
  ['言道', 'stated'],
  ['脱口', 'blurted out'],
  ['公布了出来', 'announced it publicly'],

  // Relations & Entities
  ['华裔男子', 'Chinese-descent man'],
  ['华裔中年男子', 'middle-aged Chinese man'],
  ['中年男子', 'middle-aged man'],
  ['白发老者', 'white-haired elder'],
  ['黑袍人', 'black-robed figure'],
  ['少年', 'youth'],
  ['少女', 'young maiden'],
  ['老者', 'elder'],
  ['族长', 'Patriarch'],
  ['大长老', 'Grand Elder'],
  ['二长老', 'Second Elder'],
  ['师尊', 'Master'],
  ['徒儿', 'disciple'],
  ['父亲', 'father'],
  ['母亲', 'mother'],
  ['萧家', 'Xiao Family'],
  ['纳兰家', 'Nalan Family'],

  // Action Verbs
  ['深吸了一口气', 'took a deep breath'],
  ['紧握双拳', 'clenched both fists tightly'],
  ['紧握的手掌', 'tightly clenched fists'],
  ['停下脚步', 'paused his footsteps'],
  ['转过身', 'turned around'],
  ['缓缓抬起头来', 'slowly raised his head'],
  ['抬起头', 'raised head'],
  ['低下头', 'lowered head'],
  ['迎面走来', 'walked forward to meet him'],
  ['准备转身离开', 'prepared to turn and leave'],
  ['离开', 'leave'],
  ['退后', 'stepped back'],
  ['前进一步', 'took a step forward'],
  ['盘膝而坐', 'sat down cross-legged'],
  ['闭目养神', 'closed his eyes to meditate'],
  ['睁开双眸', 'opened his eyes'],
  ['睁开眼睛', 'opened his eyes'],
  ['狂奔而出', 'dashed out frantically'],
  ['腾空而起', 'soared into the sky'],
  ['破空而去', 'tore through the void and departed'],
  ['闪烁', 'flickered'],
  ['爆发', 'erupted'],
  ['席卷', 'swept across'],
  ['凝聚', 'condensed'],
  ['吞噬', 'devoured'],
  ['撕裂', 'tore apart'],

  // Expressions & Sensations
  ['有些稚嫩的清秀脸庞', 'somewhat youthful, delicate face'],
  ['清秀脸庞', 'delicate face'],
  ['精致的面庞', 'exquisite face'],
  ['金色竖瞳', 'golden slit pupils'],
  ['黑色双眸', 'dark eyes'],
  ['黑色头发', 'black hair'],
  ['紫裙', 'purple dress'],
  ['白袍', 'white robe'],
  ['目光', 'gaze'],
  ['眼神', 'eyes'],
  ['神色', 'expression'],
  ['心中', 'in his heart'],
  ['掌心之中', 'into the palm of his hand'],
  ['呼吸有些急促', 'breathing became ragged'],
  ['嘲讽的骚动', 'commotion of ridicule'],
  ['不屑嘲笑', 'contemptuous laughter'],
  ['惋惜叹息', 'regretful sighs'],
  ['犹如一把把重锤', 'like heavy hammers'],
  ['这一年', 'this past year'],
  ['曾经的天骄', 'former peerless genius'],
  ['如此地步', 'such a fallen state'],
  ['资格', 'qualification'],
  ['驱逐出家族', 'expelled from the clan'],

  // Common Particles, Prepositions & Adverbs
  ['缓缓', 'slowly'],
  ['突然', 'suddenly'],
  ['猛然', 'abruptly'],
  ['立刻', 'immediately'],
  ['顿时', 'instantly'],
  ['悄然', 'silently'],
  ['依然', 'still'],
  ['果然', 'sure enough, as expected'],
  ['因为', 'because'],
  ['导致', 'causing'],
  ['略微', 'slightly'],
  ['甚至', 'even'],
  ['犹如', 'resembling'],
  ['充斥着', 'filled with'],
  ['带着一丝', 'carrying a trace of'],
  ['若是', 'if it were'],
  ['要不是', 'were it not for'],
  ['哪里还有', 'how could there still be'],
  ['真真是', 'truly is'],
  ['周围传来的', 'coming from all around'],
  ['落在', 'falling upon'],
  ['令得', 'causing'],
  ['闪亮得', 'shining brightly so that']
];

export function simulateLLMTranslationDraft(rawChinese: string, glossary: GlossaryEntry[]): string {
  if (!rawChinese) return '';

  const paragraphs = rawChinese.split('\n');
  const translatedParagraphs: string[] = [];

  // Build sorted dictionary database (longest match first)
  const combinedDict: [string, string][] = [];

  // 1. User Glossary
  for (const g of glossary) {
    if (g.originalZh && g.translatedEn) {
      combinedDict.push([g.originalZh, g.translatedEn]);
    }
  }

  // 2. Master Xianxia & Cultivation Extended Dictionary
  for (const ed of EXTENDED_DICTIONARY_DATA) {
    if (ed.simplifiedZh && ed.englishDefinition) {
      // Use clean English definition without slash annotations
      const cleanDef = ed.englishDefinition.split('/')[0].trim();
      combinedDict.push([ed.simplifiedZh, cleanDef]);
      if (ed.traditionalZh && ed.traditionalZh !== ed.simplifiedZh) {
        combinedDict.push([ed.traditionalZh, cleanDef]);
      }
    }
  }

  // 3. Common Web Novel Lexicon
  for (const [zh, en] of COMMON_WEBNOVEL_LEXICON) {
    combinedDict.push([zh, en]);
  }

  // Sort descending by character length to prevent partial character substring shadowing
  combinedDict.sort((a, b) => b[0].length - a[0].length);

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      translatedParagraphs.push('');
      continue;
    }

    let text = trimmed;

    // Step 1: Replace known multi-character phrases with safe delimiter placeholders
    const placeholderMap: Map<string, string> = new Map();
    let placeholderCounter = 0;

    for (const [zh, en] of combinedDict) {
      if (text.includes(zh)) {
        const ph = `__TOK_${placeholderCounter++}__`;
        placeholderMap.set(ph, en);
        text = text.replaceAll(zh, ` ${ph} `);
      }
    }

    // Step 2: Convert Chinese punctuation to English
    text = text
      .replaceAll('\u201c', '"').replaceAll('\u201d', '"')
      .replaceAll('“', '"').replaceAll('”', '"')
      .replaceAll('‘', "'").replaceAll('’', "'")
      .replaceAll('\uff01', '! ').replaceAll('！', '! ')
      .replaceAll('\uff1f', '? ').replaceAll('？', '? ')
      .replaceAll('\uff1b', '; ').replaceAll('；', '; ')
      .replaceAll('\uff1a', ': ').replaceAll('：', ': ')
      .replaceAll('\uff0c', ', ').replaceAll('，', ', ')
      .replaceAll('\u3002', '. ').replaceAll('。', '. ')
      .replaceAll('\u3001', ', ').replaceAll('、', ', ')
      .replaceAll('\u2026', '...').replaceAll('……', '...')
      .replaceAll('——', ' — ');

    // Step 3: Handle single residual Chinese characters with Pinyin fallback
    text = text.replace(/[\u4e00-\u9fa5]+/g, (match) => {
      const pinyin = getPinyinForText(match);
      return ` ${pinyin} `;
    });

    // Step 4: Re-insert translated tokens
    for (const [ph, en] of placeholderMap.entries()) {
      text = text.replaceAll(ph, en);
    }

    // Step 5: Clean spacing and punctuation grammar
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.!?;:])/g, '$1')
      .replace(/([.!?])\s*([a-z])/g, (_, p, letter) => `${p} ${letter.toUpperCase()}`)
      .trim();

    if (text) {
      // Capitalize first letter of paragraph
      text = text.charAt(0).toUpperCase() + text.slice(1);
      translatedParagraphs.push(text);
    }
  }

  return translatedParagraphs.join('\n');
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

/**
 * Re-translates a single paragraph using specified tone style and glossary constraints.
 */
export function retranslateParagraph(
  rawZh: string,
  glossary: GlossaryEntry[],
  style: TranslationStyle = 'xianxia'
): string {
  if (!rawZh || !rawZh.trim()) return '';

  let draft = simulateLLMTranslationDraft(rawZh, glossary);

  // Apply style-specific tone adjustments
  if (style === 'xianxia') {
    draft = draft
      .replace(/\bmaster\b/gi, 'Master')
      .replace(/\bsect master\b/gi, 'Sect Leader')
      .replace(/\byoung master\b/gi, 'Young Master')
      .replace(/\belder\b/gi, 'Elder')
      .replace(/\blooking for death\b/gi, 'courting death!')
      .replace(/\bseeking death\b/gi, 'courting death!');
  } else if (style === 'fluent') {
    // Simplify archaic syntax for snappy modern reading
    draft = draft
      .replace(/\bwhere could there still be\b/gi, 'there was no longer any')
      .replace(/\bcarrying a trace of\b/gi, 'with a hint of')
      .replace(/\bthe heart within\b/gi, 'inside')
      .replace(/\bshining brightly so that\b/gi, 'dazzling enough to');
  }

  // Capitalize sentence beginnings
  if (draft.length > 0) {
    draft = draft.charAt(0).toUpperCase() + draft.slice(1);
  }

  return draft;
}

/**
 * Generates 2-3 alternate phrasing candidates for a paragraph.
 */
export function getParagraphAlternatives(
  rawZh: string,
  currentEn: string,
  glossary: GlossaryEntry[]
): string[] {
  const alts = new Set<string>();

  const xianxiaDraft = retranslateParagraph(rawZh, glossary, 'xianxia');
  const fluentDraft = retranslateParagraph(rawZh, glossary, 'fluent');
  const faithfulDraft = simulateLLMTranslationDraft(rawZh, glossary);

  if (xianxiaDraft && xianxiaDraft !== currentEn) alts.add(xianxiaDraft);
  if (fluentDraft && fluentDraft !== currentEn) alts.add(fluentDraft);
  if (faithfulDraft && faithfulDraft !== currentEn) alts.add(faithfulDraft);

  // If no alternatives yet, create a polished variant
  if (alts.size === 0 && currentEn) {
    alts.add(currentEn.replace(/\bHe\b/g, 'The youth').replace(/\bhis\b/g, "the boy's"));
  }

  return Array.from(alts).slice(0, 3);
}
