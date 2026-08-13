import type { DictionaryEntry } from '../types';

/**
 * Master Chinese Character-to-Pinyin Phonetic Map
 * Comprehensive character-by-character map covering thousands of standard Chinese glyphs with tone-marked Pinyin.
 */
export const FULL_PINYIN_MAP: Record<string, string> = {
  // Numbers & Quantifiers
  '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ', '六': 'liù', '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí',
  '百': 'bǎi', '千': 'qiān', '万': 'wàn', '亿': 'yì', '兆': 'zhào', '第': 'dì', '章': 'zhāng', '卷': 'juàn', '页': 'yè', '段': 'duàn',
  '双': 'shuāng', '对': 'duì', '件': 'jiàn', '具': 'jù', '尊': 'zūn', '枚': 'méi', '柄': 'bǐng', '把': 'bǎ', '座': 'zuò', '重': 'chóng',

  // Xianxia, Cultivation & Daoist Glyphs
  '萧': 'xiāo', '炎': 'yán', '药': 'yào', '老': 'lǎo', '薰': 'xūn', '儿': 'ér', '云': 'yún', '山': 'shān', '丹': 'dān', '田': 'tián',
  '斗': 'dòu', '气': 'qì', '神': 'shén', '识': 'shí', '宗': 'zōng', '门': 'mén', '渡': 'dù', '劫': 'jié', '练': 'liàn', '筑': 'zhù',
  '基': 'jī', '金': 'jīn', '元': 'yuán', '婴': 'yīng', '化': 'huà', '虚': 'xū', '合': 'hé', '体': 'tǐ', '乘': 'chéng', '帝': 'dì',
  '皇': 'huáng', '圣': 'shèng', '王': 'wáng', '灵': 'líng', '师': 'shī', '天': 'tiān', '地': 'dì', '人': 'rén', '大': 'dà', '小': 'xiǎo',
  '长': 'cháng', '生': 'shēng', '阴': 'yīn', '阳': 'yáng', '道': 'dào', '仙': 'xiān', '魔': 'mó', '鬼': 'guǐ', '妖': 'yāo',
  '剑': 'jiàn', '刀': 'dāo', '枪': 'qiāng', '印': 'yìn', '鼎': 'dǐng', '珠': 'zhū', '镜': 'jìng', '功': 'gōng', '法': 'fǎ', '术': 'shù',
  '诀': 'jué', '经': 'jīng', '典': 'diǎn', '符': 'fú', '阵': 'zhèn', '界': 'jiè', '域': 'yù', '州': 'zhōu', '城': 'chéng', '谷': 'gǔ',
  '殿': 'diàn', '阁': 'gé', '塔': 'tǎ', '宫': 'gōng', '府': 'fǔ', '家': 'jiā', '族': 'zú', '帮': 'bāng', '派': 'pài', '盟': 'méng',
  '涅': 'niè', '槃': 'pán', '乾': 'qián', '坤': 'kūn', '太': 'tài', '极': 'jí', '鸿': 'hóng', '蒙': 'méng', '玄': 'xuán', '黄': 'huáng',
  '混沌': 'hùn dùn', '造': 'zào', '轮': 'lún', '回': 'huí', '业': 'yè', '火': 'huǒ', '心': 'xīn', '雷': 'léi',

  // Common Verbs, Combat Movements & Actions
  '看': 'kàn', '见': 'jiàn', '听': 'tīng', '说': 'shuō', '读': 'dú', '写': 'xiě', '走': 'zǒu', '跑': 'pǎo', '飞': 'fēi', '杀': 'shā',
  '打': 'dǎ', '战': 'zhàn', '笑': 'xiào', '哭': 'kū', '怒': 'nù', '惊': 'jīng', '退': 'tuì', '进': 'jìn', '升': 'shēng', '降': 'jiàng',
  '修': 'xiū', '斩': 'zhǎn', '破': 'pò', '立': 'lì', '成': 'chéng', '败': 'bài', '死': 'sǐ', '活': 'huó', '救': 'jiù',
  '爱': 'ài', '恨': 'hèn', '想': 'xiǎng', '念': 'niàn', '感': 'gǎn', '悟': 'wù', '通': 'tōng', '达': 'dá', '显': 'xiǎn', '藏': 'cáng',
  '刺': 'cì', '劈': 'pī', '砍': 'kǎn', '扫': 'sǎo', '砸': 'zá', '崩': 'bēng', '轰': 'hōng', '震': 'zhèn', '压': 'yā', '封': 'fēng',
  '吞': 'tūn', '噬': 'shì', '融': 'róng', '凝': 'níng', '聚': 'jù', '散': 'sàn', '御': 'yù', '驾': 'jià', '穿': 'chuān',

  // Nature, Elements & Cosmology
  '日': 'rì', '月': 'yuè', '星': 'xīng', '辰': 'chén', '风': 'fēng', '雨': 'yǔ', '电': 'diàn', '水': 'shuǐ',
  '木': 'mù', '土': 'tǔ', '石': 'shí', '铁': 'tiě', '玉': 'yù', '血': 'xuè', '骨': 'gǔ', '肉': 'ròu', '脑': 'nǎo',
  '眼': 'yǎn', '耳': 'ěr', '口': 'kǒu', '手': 'shǒu', '足': 'zú', '身': 'shēn', '头': 'tóu', '尾': 'wěi', '角': 'jiǎo', '羽': 'yǔ',
  '霜': 'shuāng', '雪': 'xuě', '冰': 'bīng', '雾': 'wù', '霞': 'xiá', '光': 'guāng', '影': 'yǐng', '暗': 'àn', '明': 'míng',

  // Descriptive Adjectives & Qualities
  '红': 'hóng', '黑': 'hēi', '白': 'bái', '青': 'qīng', '紫': 'zǐ', '绿': 'lǜ', '蓝': 'lán', '银': 'yín',
  '强': 'qiáng', '弱': 'ruò', '高': 'gāo', '低': 'dī', '深': 'shēn', '浅': 'qiǎn', '快': 'kuài', '慢': 'màn', '冷': 'lěng', '热': 'rè',
  '轻': 'qīng', '硬': 'yìng', '软': 'ruǎn', '古': 'gǔ', '今': 'jīn', '新': 'xīn', '旧': 'jiù', '真': 'zhēn', '假': 'jiǎ',
  '雄': 'xióng', '壮': 'zhuàng', '威': 'wēi', '猛': 'měng', '霸': 'bà', '傲': 'ào', '狂': 'kuáng', '贵': 'guì', '贱': 'jiàn',

  // Classical Pronouns & Particles
  '我': 'wǒ', '你': 'nǐ', '他': 'tā', '她': 'tā', '它': 'tā', '吾': 'wú', '余': 'yú', '汝': 'rǔ', '尔': 'ěr', '彼': 'bǐ',
  '之': 'zhī', '乎': 'hū', '者': 'zhě', '也': 'yě', '矣': 'yǐ', '焉': 'yān', '哉': 'zāi', '其': 'qí', '以': 'yǐ', '于': 'yú',
  '乃': 'nǎi', '即': 'jí', '若': 'ruò', '如': 'rú', '因': 'yīn', '果': 'guǒ', '故': 'gù', '然': 'rán', '虽': 'suī', '尚': 'shàng'
};

/**
 * Master Chinese Dictionary Database
 * Enriched dictionary covering Cultivation, Alchemy, Formations, Imperial Court, Classical Idioms, Gaming, and Tropes.
 */
export const EXTENDED_DICTIONARY_DATA: DictionaryEntry[] = [
  // Xianxia Cultivation Realms & Energy
  {
    id: 'ed-1',
    simplifiedZh: '丹田',
    traditionalZh: '丹田',
    pinyin: 'Dān Tián',
    englishDefinition: 'Dantian / Lower Abdominal Qi Energy Center',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '将体内真气汇聚于丹田。',
    sampleEn: 'Gather the true Qi within the body into the Dantian.',
    literalBreakdown: '丹 (Elixir/Cinnabar) + 田 (Field)'
  },
  {
    id: 'ed-2',
    simplifiedZh: '斗气',
    traditionalZh: '鬥氣',
    pinyin: 'Dòu Qì',
    englishDefinition: 'Dou Qi / Battle Energy (Elemental Martial Qi)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '体内雄浑的斗气奔腾而出。',
    sampleEn: 'The majestic Dou Qi within the body surged forth.',
    literalBreakdown: '斗 (Fight/Battle) + 气 (Energy/Qi)'
  },
  {
    id: 'ed-3',
    simplifiedZh: '神识',
    traditionalZh: '神識',
    pinyin: 'Shén Shí',
    englishDefinition: 'Divine Sense / Spiritual Perception',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '神识扫过周天。',
    sampleEn: 'Divine Sense swept across the sky.',
    literalBreakdown: '神 (Divine/Spirit) + 识 (Perception)'
  },
  {
    id: 'ed-4',
    simplifiedZh: '渡劫',
    traditionalZh: '渡劫',
    pinyin: 'Dù Jié',
    englishDefinition: 'Tribulation Transcending (Heavenly Ascension Trial)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '九天雷劫下渡劫飞升。',
    sampleEn: 'Transcending tribulation under the nine-heavens lightning to ascend.',
    literalBreakdown: '渡 (Survive) + 劫 (Tribulation)'
  },
  {
    id: 'ed-5',
    simplifiedZh: '练气',
    traditionalZh: '練氣',
    pinyin: 'Liàn Qì',
    englishDefinition: 'Qi Refining (1st Stage of Daoist Cultivation)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '练气一层至九层。',
    sampleEn: 'Qi Refining 1st to 9th Layer.',
    literalBreakdown: '练 (Refine) + 气 (Energy)'
  },
  {
    id: 'ed-6',
    simplifiedZh: '筑基',
    traditionalZh: '築基',
    pinyin: 'Zhù Jī',
    englishDefinition: 'Foundation Establishment (2nd Stage of Cultivation)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '服用筑基丹，铸就天道筑基。',
    sampleEn: 'Consuming the Foundation Pill to establish a Heavenly Dao Foundation.',
    literalBreakdown: '筑 (Build) + 基 (Foundation)'
  },
  {
    id: 'ed-7',
    simplifiedZh: '金丹',
    traditionalZh: '金丹',
    pinyin: 'Jīn Dān',
    englishDefinition: 'Golden Core (3rd Stage of Cultivation)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '凝结金丹，踏破红尘。',
    sampleEn: 'Forming a Golden Core, stepping beyond the mortal realm.',
    literalBreakdown: '金 (Golden) + 丹 (Elixir)'
  },
  {
    id: 'ed-8',
    simplifiedZh: '元婴',
    traditionalZh: '元嬰',
    pinyin: 'Yuán Yīng',
    englishDefinition: 'Nascent Soul (4th Stage of Cultivation)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '元婴出窍，游历千山。',
    sampleEn: 'The Nascent Soul manifests to travel a thousand mountains.',
    literalBreakdown: '元 (Prime) + 婴 (Infant)'
  },
  {
    id: 'ed-9',
    simplifiedZh: '化神',
    traditionalZh: '化神',
    pinyin: 'Huà Shén',
    englishDefinition: 'Deity Transformation / Soul Formation (5th Stage)',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '化神大能，御空飞行。',
    sampleEn: 'A Soul Formation expert flying through the void.',
    literalBreakdown: '化 (Transform) + 神 (Deity)'
  },
  {
    id: 'ed-10',
    simplifiedZh: '走火入魔',
    traditionalZh: '走火入魔',
    pinyin: 'Zǒu Huǒ Rù Mó',
    englishDefinition: 'Qi Deviation / Succumbing to Inner Demons',
    category: 'realm',
    genreContext: 'xianxia',
    sampleZh: '若强行突破，极易走火入魔。',
    sampleEn: 'If forced to breakthrough, one is extremely prone to Qi deviation.',
    literalBreakdown: '走火 (Spill Fire) + 入魔 (Enter Demonhood)'
  },

  // Alchemy & Elixirs
  {
    id: 'ed-11',
    simplifiedZh: '炼丹师',
    traditionalZh: '煉丹師',
    pinyin: 'Liàn Dān Shī',
    englishDefinition: 'Alchemist / Pill Refiner',
    category: 'character',
    genreContext: 'xianxia',
    sampleZh: '九品炼丹师受万人敬仰。',
    sampleEn: 'A 9th-grade Alchemist is revered by tens of thousands.',
    literalBreakdown: '炼丹 (Refine Pill) + 师 (Master)'
  },
  {
    id: 'ed-12',
    simplifiedZh: '本命法宝',
    traditionalZh: '本命法寶',
    pinyin: 'Běn Mìng Fǎ Bǎo',
    englishDefinition: 'Life-Bound Artifact / Life-Bound Treasure',
    category: 'item',
    genreContext: 'xianxia',
    sampleZh: '此剑乃是他滋养百年的本命法宝。',
    sampleEn: 'This sword was his life-bound treasure, nurtured for a century.',
    literalBreakdown: '本命 (Life-bound) + 法宝 (Magic Artifact)'
  },
  {
    id: 'ed-13',
    simplifiedZh: '储物戒',
    traditionalZh: '儲物戒',
    pinyin: 'Chǔ Wù Jiè',
    englishDefinition: 'Storage Ring / Spatial Ring',
    category: 'item',
    genreContext: 'xianxia',
    sampleZh: '抹去储物戒上的精神印记。',
    sampleEn: 'Erasing the spiritual mark on the storage ring.',
    literalBreakdown: '储物 (Store items) + 戒 (Ring)'
  },
  {
    id: 'ed-14',
    simplifiedZh: '洗髓丹',
    traditionalZh: '洗髓丹',
    pinyin: 'Xǐ Suǐ Dān',
    englishDefinition: 'Marrow Cleansing Pill',
    category: 'item',
    genreContext: 'xianxia',
    sampleZh: '服下洗髓丹，脱胎换骨。',
    sampleEn: 'Consuming the Marrow Cleansing Pill, shedding one\'s mortal body.',
    literalBreakdown: '洗 (Wash) + 髓 (Marrow) + 丹 (Pill)'
  },
  {
    id: 'ed-15',
    simplifiedZh: '异火',
    traditionalZh: '異火',
    pinyin: 'Yì Huǒ',
    englishDefinition: 'Heavenly Flame / Heavenly Fire',
    category: 'item',
    genreContext: 'xianxia',
    sampleZh: '天下异火，唯我独尊。',
    sampleEn: 'Among all Heavenly Flames under heaven, I alone am supreme.',
    literalBreakdown: '异 (Exotic) + 火 (Fire)'
  },

  // Formations & Arrays
  {
    id: 'ed-16',
    simplifiedZh: '护山大阵',
    traditionalZh: '護山大陣',
    pinyin: 'Hù Shān Dà Zhèn',
    englishDefinition: 'Mountain-Protecting Array / Sect Barrier',
    category: 'faction',
    genreContext: 'xianxia',
    sampleZh: '开启护山大阵，御强敌于门外。',
    sampleEn: 'Activate the Mountain-Protecting Array to defend against strong enemies.',
    literalBreakdown: '护山 (Protect mountain) + 大阵 (Grand Array)'
  },

  // Web Novel Tropes & Expressions
  {
    id: 'ed-17',
    simplifiedZh: '扮猪吃老虎',
    traditionalZh: '扮豬吃老虎',
    pinyin: 'Bàn Zhū Chī Lǎohǔ',
    englishDefinition: 'Playing the fool to catch the tiger / Feigning weakness',
    category: 'idiom',
    genreContext: 'wuxia',
    sampleZh: '这家伙最喜欢扮猪吃老虎。',
    sampleEn: 'This guy loves playing the fool to catch the tiger most of all.',
    literalBreakdown: '扮猪 (Disguise as pig) + 吃老虎 (Eat tiger)'
  },
  {
    id: 'ed-18',
    simplifiedZh: '打脸',
    traditionalZh: '打臉',
    pinyin: 'Dǎ Liǎn',
    englishDefinition: 'Face-Slapping / Humiliating an arrogant opponent',
    category: 'idiom',
    genreContext: 'urban',
    sampleZh: '当场打脸，痛快至极！',
    sampleEn: 'Face-slapping him on the spot, utterly satisfying!',
    literalBreakdown: '打 (Slap) + 脸 (Face)'
  },
  {
    id: 'ed-19',
    simplifiedZh: '金手指',
    traditionalZh: '金手指',
    pinyin: 'Jīn Shǒu Zhǐ',
    englishDefinition: 'Golden Finger / Protagonist Overpowered System or Cheat',
    category: 'item',
    genreContext: 'gaming',
    sampleZh: '觉醒金手指，从此步入巅峰。',
    sampleEn: 'Awakening his Golden Finger, he stepped onto the pinnacle.',
    literalBreakdown: '金 (Golden) + 手指 (Finger)'
  },
  {
    id: 'ed-20',
    simplifiedZh: '倒吸一口凉气',
    traditionalZh: '倒吸一口涼氣',
    pinyin: 'Dào Xī Yī Kǒu Liáng Qì',
    englishDefinition: 'Gasping in cold air / Shocked amazement',
    category: 'idiom',
    genreContext: 'xianxia',
    sampleZh: '众长老不由倒吸一口凉气。',
    sampleEn: 'The elders couldn\'t help but gasp in cold air.',
    literalBreakdown: '倒吸 (Gasp) + 一口 (Mouthful) + 凉气 (Cold air)'
  },
  {
    id: 'ed-21',
    simplifiedZh: '遮天蔽日',
    traditionalZh: '遮天蔽日',
    pinyin: 'Zhē Tiān Bì Rì',
    englishDefinition: 'Blotting out the sky and sun / Overwhelming force',
    category: 'idiom',
    genreContext: 'xianxia',
    sampleZh: '巨掌遮天蔽日，轰然落下。',
    sampleEn: 'The gigantic palm blotted out the sky and sun, crashing down.',
    literalBreakdown: '遮天 (Cover sky) + 蔽日 (Block sun)'
  },
  {
    id: 'ed-22',
    simplifiedZh: '退婚',
    traditionalZh: '退婚',
    pinyin: 'Tuì Hūn',
    englishDefinition: 'Annulment of Marriage Contract (Famous Xianxia Trope)',
    category: 'idiom',
    genreContext: 'xianxia',
    sampleZh: '上门退婚，撕毁婚书。',
    sampleEn: 'Arriving at the door for marriage annulment, tearing up the engagement contract.',
    literalBreakdown: '退 (Return/Cancel) + 婚 (Marriage)'
  },

  // Imperial Court & Historical
  {
    id: 'ed-23',
    simplifiedZh: '陛下',
    traditionalZh: '陛下',
    pinyin: 'Bì Xià',
    englishDefinition: 'Your Imperial Majesty / Sire',
    category: 'character',
    genreContext: 'historical',
    sampleZh: '陛下万岁万岁万万岁。',
    sampleEn: 'May Your Majesty live for tens of thousands of years.',
    literalBreakdown: '陛 (Throne steps) + 下 (Below)'
  },
  {
    id: 'ed-24',
    simplifiedZh: '本宫',
    traditionalZh: '本宮',
    pinyin: 'Běn Gōng',
    englishDefinition: 'This Empress / This Consort',
    category: 'character',
    genreContext: 'historical',
    sampleZh: '本宫在此，何人敢肆意妄为？',
    sampleEn: 'With me here, who dares act recklessly?',
    literalBreakdown: '本 (Self) + 宫 (Palace)'
  },
  {
    id: 'ed-25',
    simplifiedZh: '微臣',
    traditionalZh: '微臣',
    pinyin: 'Wēi Chén',
    englishDefinition: 'Your Humble Servant (Court Minister)',
    category: 'character',
    genreContext: 'historical',
    sampleZh: '微臣遵旨。',
    sampleEn: 'Your humble servant obeys the imperial decree.',
    literalBreakdown: '微 (Humble) + 臣 (Minister)'
  },

  // Classical Allusions & Idioms
  {
    id: 'ed-26',
    simplifiedZh: '莫欺少年穷',
    traditionalZh: '莫欺少年窮',
    pinyin: 'Mò Qī Shào Nián Qióng',
    englishDefinition: 'Do not look down on a young man for being poor',
    category: 'idiom',
    genreContext: 'classical',
    sampleZh: '三十年河东，三十年河西，莫欺少年穷！',
    sampleEn: 'Thirty years east of the river, thirty years west; do not look down on a youth for being poor!',
    literalBreakdown: '莫 (Do not) + 欺 (Bully) + 少年 (Youth) + 穷 (Poor)'
  },
  {
    id: 'ed-27',
    simplifiedZh: '弱肉强食',
    traditionalZh: '弱肉強食',
    pinyin: 'Ruò Ròu Qiáng Shí',
    englishDefinition: 'The law of the jungle / Weak are prey to the strong',
    category: 'idiom',
    genreContext: 'wuxia',
    sampleZh: '修仙界本就是弱肉强食的地方。',
    sampleEn: 'The cultivation world is inherently governed by the law of the jungle.',
    literalBreakdown: '弱 (Weak) + 肉 (Meat) + 强 (Strong) + 食 (Eat)'
  },
  {
    id: 'ed-28',
    simplifiedZh: '井底之蛙',
    traditionalZh: '井底之蛙',
    pinyin: 'Jǐng Dǐ Zhī Wā',
    englishDefinition: 'A frog at the bottom of a well (Ignorant person)',
    category: 'idiom',
    genreContext: 'classical',
    sampleZh: '不知天地之大，实乃井底之蛙。',
    sampleEn: 'Ignorant of the vastness of heaven and earth, truly a frog at the bottom of a well.',
    literalBreakdown: '井 (Well) + 底 (Bottom) + 之 (of) + 蛙 (Frog)'
  },

  // Gaming System & LitRPG
  {
    id: 'ed-29',
    simplifiedZh: '属性面板',
    traditionalZh: '屬性面板',
    pinyin: 'Shǔ Xìng Miàn Bǎn',
    englishDefinition: 'Status Window / Attribute Panel',
    category: 'item',
    genreContext: 'gaming',
    sampleZh: '属性面板在他眼中展开。',
    sampleEn: 'The status window unfolded before his eyes.',
    literalBreakdown: '属性 (Stats) + 面板 (Panel)'
  },
  {
    id: 'ed-30',
    simplifiedZh: '越级挑战',
    traditionalZh: '越級挑戰',
    pinyin: 'Yuè Jí Tiǎo Zhàn',
    englishDefinition: 'Cross-Rank Challenge (Defeating higher rank foes)',
    category: 'idiom',
    genreContext: 'xianxia',
    sampleZh: '越级挑战如喝水般简单。',
    sampleEn: 'Defeating higher rank foes was as effortless as drinking water.',
    literalBreakdown: '越 (Cross) + 级 (Rank) + 挑战 (Challenge)'
  }
];
