import type { EntityCategory, Gender, GlossaryEntry } from '../types';

export interface ExtractedEntity {
  originalZh: string;
  suggestedEn: string;
  category: EntityCategory;
  gender?: Gender;
  count: number;
  confidence: number;
  sampleSentence: string;
}

// Common Xianxia & Web Novel Keyword Pattern Matchers
const REALM_KEYWORDS = ['斗者', '斗师', '大斗师', '斗灵', '斗王', '斗皇', '斗宗', '斗尊', '斗圣', '斗帝', '练气', '筑基', '金丹', '元婴', '化神', '炼虚', '合体', '大乘', '渡劫', '序列', '超凡'];
const FACTION_KEYWORDS = ['宗', '派', '门', '阁', '谷', '殿', '家', '族', '学院', '圣地', '商会'];
const LOCATION_KEYWORDS = ['城', '山', '界', '洲', '国', '大陆', '峡谷', '森林', '秘境', '陵园'];

// Blacklist of common slang, comment phrases, and non-entity words to exclude
const NOISE_BLACK_TERMS = [
  '收收味吧', '收收味', '全订', '打卡', '三刷', '二刷', '我就说', '你怎么', '异形番外', '这辈子',
  '在这异国', '大白话', '因为', '但是', '如果', '什么', '怎么', '作者', '推文', '评论', '目录'
];

// Comprehensive English Translation Dictionary for Chinese Terms & Names
const KNOWN_TERM_MAP: Record<string, string> = {
  '华裔男子': 'Chinese-descent Man',
  '在这异国': 'Foreign Country',
  '狂暴龙': 'Indominus Dragon',
  '老肝妈': 'Lao Gan Ma',
  '亨利': 'Henry',
  '西蒙': 'Simon',
  '黑咕隆咚': 'Pitch Black Water',
  '金色竖瞳': 'Golden Slit Pupils',
  '萧炎': 'Xiao Yan',
  '纳兰嫣然': 'Nalan Yanran',
  '药老': 'Yao Lao',
  '薰儿': 'Xun\'er',
  '云山': 'Yun Shan',
  '克莱恩': 'Klein',
  '奥黛丽': 'Audrey',
  '阿尔杰': 'Alger'
};

/**
 * Chinese Named Entity Extraction (NER) heuristic engine
 * Scans Chinese raw text for names, titles, places, realms, items, and gender hints
 */
export function extractEntitiesFromChinese(rawText: string, existingGlossary: GlossaryEntry[]): ExtractedEntity[] {
  const existingZhMap = new Set(existingGlossary.map(g => g.originalZh));
  const results: Map<string, ExtractedEntity> = new Map();

  // Helper to check if a term is valid
  const isValidEntity = (term: string) => {
    if (existingZhMap.has(term)) return false;
    if (NOISE_BLACK_TERMS.some(b => term.includes(b))) return false;
    if (term.length < 2 || term.length > 6) return false;
    return true;
  };

  // 1. Known Terms Dictionary Matching
  for (const [zh, en] of Object.entries(KNOWN_TERM_MAP)) {
    if (rawText.includes(zh) && isValidEntity(zh)) {
      const count = (rawText.match(new RegExp(zh, 'g')) || []).length;
      results.set(zh, {
        originalZh: zh,
        suggestedEn: en,
        category: 'character',
        gender: detectGender(rawText, zh),
        count,
        confidence: 0.95,
        sampleSentence: getSampleSentence(rawText, rawText.indexOf(zh))
      });
    }
  }

  // 2. Character Name Extraction (Pattern: 萧XX, 纳兰XX, 药老, 熏儿, 陆XX, etc.)
  const chineseNameRegex = /([\u4e00-\u9fa5]{2,4})(?:哥|姐|弟|妹|师兄|师姐|长老|族长|宗主|少主|老|氏|公子|姑娘)/g;
  let match;
  while ((match = chineseNameRegex.exec(rawText)) !== null) {
    const term = match[1];
    if (isValidEntity(term) && !results.has(term)) {
      const sentence = getSampleSentence(rawText, match.index);
      const gender = detectGender(rawText, term);
      const count = (rawText.match(new RegExp(term, 'g')) || []).length;
      
      results.set(term, {
        originalZh: term,
        suggestedEn: pinyinOrPlausibleName(term),
        category: 'character',
        gender,
        count,
        confidence: 0.88,
        sampleSentence: sentence
      });
    }
  }

  // 3. Scan quotes for Dialogue Speaker Detection (e.g. “...” 萧炎说道 / 冷笑道)
  const speakerRegex = /“[^”]+”[\s]*([\u4e00-\u9fa5]{2,4})(?:说|道|叹|笑|喊|怒吼|回应)/g;
  while ((match = speakerRegex.exec(rawText)) !== null) {
    const speaker = match[1];
    if (isValidEntity(speaker) && !results.has(speaker)) {
      const gender = detectGender(rawText, speaker);
      const count = (rawText.match(new RegExp(speaker, 'g')) || []).length;
      results.set(speaker, {
        originalZh: speaker,
        suggestedEn: pinyinOrPlausibleName(speaker),
        category: 'character',
        gender,
        count,
        confidence: 0.92,
        sampleSentence: match[0].substring(0, 30) + '...'
      });
    }
  }

  // 4. Sects & Factions
  for (const keyword of FACTION_KEYWORDS) {
    const factionRegex = new RegExp(`([\\u4e00-\\u9fa5]{2,4}${keyword})`, 'g');
    while ((match = factionRegex.exec(rawText)) !== null) {
      const term = match[1];
      if (isValidEntity(term) && !results.has(term)) {
        const count = (rawText.match(new RegExp(term, 'g')) || []).length;
        results.set(term, {
          originalZh: term,
          suggestedEn: capitalizeWords(term) + ' Sect',
          category: 'faction',
          count,
          confidence: 0.85,
          sampleSentence: getSampleSentence(rawText, match.index)
        });
      }
    }
  }

  // 5. Cultivation Realms
  for (const realm of REALM_KEYWORDS) {
    if (rawText.includes(realm) && isValidEntity(realm)) {
      const count = (rawText.match(new RegExp(realm, 'g')) || []).length;
      results.set(realm, {
        originalZh: realm,
        suggestedEn: realm + ' Realm',
        category: 'realm',
        count,
        confidence: 0.90,
        sampleSentence: `Rank/Realm marker found in text`
      });
    }
  }

  // 6. Locations
  for (const locKeyword of LOCATION_KEYWORDS) {
    const locRegex = new RegExp(`([\\u4e00-\\u9fa5]{2,3}${locKeyword})`, 'g');
    while ((match = locRegex.exec(rawText)) !== null) {
      const term = match[1];
      if (isValidEntity(term) && !results.has(term) && term.length >= 3) {
        const count = (rawText.match(new RegExp(term, 'g')) || []).length;
        results.set(term, {
          originalZh: term,
          suggestedEn: pinyinOrPlausibleName(term) + ' Region',
          category: 'location',
          count,
          confidence: 0.80,
          sampleSentence: getSampleSentence(rawText, match.index)
        });
      }
    }
  }

  return Array.from(results.values()).sort((a, b) => b.count - a.count);
}

function detectGender(text: string, term: string): Gender {
  const femaleContext = new RegExp(`${term}[^。！？]*?(她|少女|女子|姑娘|小姐|紫裙|娇柔)`, 'g');
  const maleContext = new RegExp(`${term}[^。！？]*?(他|少年|男子|老者|先生|少爷)`, 'g');

  const femaleScore = (text.match(femaleContext) || []).length;
  const maleScore = (text.match(maleContext) || []).length;

  if (femaleScore > maleScore) return 'female';
  if (maleScore > femaleScore) return 'male';
  return 'male';
}

function getSampleSentence(text: string, index: number): string {
  if (index < 0) return '';
  const start = Math.max(0, index - 15);
  const end = Math.min(text.length, index + 35);
  return text.substring(start, end).replace(/\n/g, ' ') + '...';
}

function pinyinOrPlausibleName(zh: string): string {
  if (KNOWN_TERM_MAP[zh]) return KNOWN_TERM_MAP[zh];

  // Character pinyin transliterator mapping
  const charMap: Record<string, string> = {
    '萧': 'Xiao ', '炎': 'Yan', '薰': 'Xun', '儿': ' Er', '药': 'Yao ', '老': 'Lao',
    '纳': 'Na', '兰': 'lan ', '嫣': 'Yan', '然': 'ran', '古': 'Gu ', '河': 'He',
    '叶': 'Ye ', '凡': 'Fan', '林': 'Lin ', '动': 'Dong', '克': 'Kle', '莱': 'in',
    '华': 'Hua ', '裔': 'Yi ', '男': 'Nan ', '子': 'Zi'
  };

  let result = '';
  for (const ch of zh) {
    result += charMap[ch] || ch + ' ';
  }
  return capitalizeWords(result.trim());
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
