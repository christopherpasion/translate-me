import { FULL_PINYIN_MAP } from '../data/chineseDictionaryData';

/**
 * Pinyin Phonetic Engine with Tone Marks
 * Converts Chinese characters into tone-accented Pinyin (e.g., 萧炎 -> Xiāo Yán, 丹田 -> Dān Tián).
 */

const PINYIN_CHAR_MAP: Record<string, string> = {
  // Common Cultivation / Novel Character Names
  '萧炎': 'Xiāo Yán',
  '纳兰嫣然': 'Nálán Yānrán',
  '药老': 'Yào Lǎo',
  '薰儿': "Xūn'ér",
  '云山': 'Yún Shān',
  '克莱恩': "Kèlái'ēn",
  '奥黛丽': 'Àodàilì',
  '阿尔杰': "Ā'ěrjié",
  '白小纯': 'Bái Xiǎochún',
  '杜雨晴': 'Dù Yǔqíng',
  '韩立': 'Hán Lì',
  '石昊': 'Shí Hào',
  '罗峰': 'Luó Fēng',

  // Terms & Realms
  '丹田': 'Dān Tián',
  '斗气': 'Dòu Qì',
  '神识': 'Shén Shí',
  '宗门': 'Zōng Mén',
  '渡劫': 'Dù Jié',
  '练气': 'Liàn Qì',
  '筑基': 'Zhù Jī',
  '金丹': 'Jīn Dān',
  '元婴': 'Yuán Yīng',
  '化神': 'Huà Shén',
  '斗者': 'Dòu Zhě',
  '斗帝': 'Dòu Dì',
  '云岚宗': 'Yún Lán Zōng',
  '乌坦城': 'Wū Tǎn Chéng',
  '焰分噬浪尺': 'Yàn Fēn Shì Làng Chǐ',
  '异火': 'Yì Huǒ',
  '焚诀': 'Fén Jué',
  '纳戒': 'Nà Jiè',
  '魔核': 'Mó Hé',
  '斗技': 'Dòu Jì',
  '功法': 'Gōng Fǎ',

  // Classical & General Vocabulary
  '读书': 'Dú Shū',
  '天下': 'Tiān Xià',
  '大道': 'Dà Dào',
  '长生': 'Cháng Shēng',
  '轮回': 'Lún Huí',
  '天地': 'Tiān Dì',
  '阴阳': 'Yīn Yáng',
  '乾坤': 'Qián Kūn',
  '霸气': 'Bà Qì',
  '至尊': 'Zhì Zūn',
  '无敌': 'Wú Dí',
  '斩仙': 'Zhǎn Xiān',
  '飞升': 'Fēi Shēng',
  '师尊': 'Shī Zūn',
  '师兄': 'Shī Xiōng',
  '师妹': 'Shī Mèi',
  '长老': 'Zhǎng Lǎo',
  '掌门': 'Zhǎng Mén',
  '宗主': 'Zōng Zhǔ',
  '陛下': 'Bì Xià',
  '殿下': 'Diàn Xià',
  '微臣': 'Wēi Chén',
  '本宫': 'Běn Gōng'
};

// Merge in FULL_PINYIN_MAP database
const COMBINED_PINYIN_MAP: Record<string, string> = {
  ...FULL_PINYIN_MAP
};

/**
 * Converts a Chinese word or phrase into tone-marked Pinyin.
 */
export function getPinyinForText(text: string): string {
  if (!text || !text.trim()) return '';

  const trimmed = text.trim();

  // Check multi-word dictionary first
  if (PINYIN_CHAR_MAP[trimmed]) {
    return PINYIN_CHAR_MAP[trimmed];
  }

  // Character by character fallback using master Pinyin map
  const result: string[] = [];
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (COMBINED_PINYIN_MAP[char]) {
      const pinyin = COMBINED_PINYIN_MAP[char];
      result.push(i === 0 ? pinyin.charAt(0).toUpperCase() + pinyin.slice(1) : pinyin);
    } else {
      result.push(char);
    }
  }

  return result.join(' ').replace(/\s+/g, ' ').trim();
}
