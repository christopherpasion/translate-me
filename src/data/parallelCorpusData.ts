export interface ParallelSentencePair {
  id: string;
  novelTitleZh: string;
  novelTitleEn: string;
  translator: string;
  genre: string;
  rawZh: string;
  officialEn: string;
  strategyNotes?: string;
}

/**
 * Internal Gold-Standard Parallel Reference Corpus
 * Sourced from top published web novel translations (Wuxiaworld, Webnovel).
 * Used internally by AI translation engine as Few-Shot Benchmarks to elevate translation prose quality.
 */
export const INTERNAL_PARALLEL_CORPUS: ParallelSentencePair[] = [
  // 1. Battle Through the Heavens (斗破苍穹) - Deathblade / Wuxiaworld Style
  {
    id: 'btth-1',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    rawZh: '“斗之力，三段！”',
    officialEn: '"Dou Zhi Qi, 3rd Duan!"',
    strategyNotes: 'Preserved cultivation tier term Dou Zhi Qi with numerical Duan classification.'
  },
  {
    id: 'btth-2',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    rawZh: '望着测验魔石碑上闪亮得甚至有点刺眼的五个大字，少年面无表情，唇角有着一抹自嘲，紧握的手掌，因为大力，而导致略微尖锐的指甲深深的刺进了掌心之中，带来一阵阵钻心的疼痛…',
    officialEn: 'Looking at the five bright and somewhat dazzling words on the Testing Magic Stone Tablet, the youth displayed an expressionless face with a touch of self-mockery at the corner of his lips. His tightly clenched fists, due to force, caused his sharp fingernails to pierce deeply into his palms, bringing bursts of piercing pain...',
    strategyNotes: 'Converted topic-comment Chinese clause into multi-part fluent English narrative.'
  },
  {
    id: 'btth-3',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    rawZh: '三十年河东，三十年河西，莫欺少年穷！',
    officialEn: '"Thirty years east of the river, thirty years west of the river; do not look down on a young man for being poor!"',
    strategyNotes: 'Iconic proverb translation balancing literal rhythm with impactful English cadence.'
  },
  {
    id: 'btth-4',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    rawZh: '在斗气大陆，没有繁杂绚丽的魔法，有的，仅仅是繁衍到巅峰的斗气！',
    officialEn: 'On the Dou Qi Continent, there was no complex or brilliant magic; there was only Dou Qi, which had developed to its absolute peak!',
    strategyNotes: 'World-building opening sentence setting elemental cultivation tone.'
  },

  // 2. Lord of Mysteries (诡秘之主) - CKtalon / Webnovel Style
  {
    id: 'lom-1',
    novelTitleZh: '诡秘之主',
    novelTitleEn: 'Lord of Mysteries',
    translator: 'CKtalon (Webnovel)',
    genre: 'scifi',
    rawZh: '痛！好痛！头好痛！',
    officialEn: 'Pain! How painful! My head hurts so much!',
    strategyNotes: 'Short, sharp inner monologue exclamation capturing immediate sensory shock.'
  },
  {
    id: 'lom-2',
    novelTitleZh: '诡秘之主',
    novelTitleEn: 'Lord of Mysteries',
    translator: 'CKtalon (Webnovel)',
    genre: 'scifi',
    rawZh: '随着蒸汽与机械的浪潮，谁能触及非凡？历史和暗夜的迷雾里，又是谁在耳语？',
    officialEn: 'With the rising tide of steam and machinery, who can come close to being a Beyonder? Swathed in the fog of mystery and horror, who is whispering in the dark?',
    strategyNotes: 'Victorian Steampunk flavor with specialized Beyonder vocabulary.'
  },
  {
    id: 'lom-3',
    novelTitleZh: '诡秘之主',
    novelTitleEn: 'Lord of Mysteries',
    translator: 'CKtalon (Webnovel)',
    genre: 'scifi',
    rawZh: '深红的星辰升起，那是超越现实的塔罗聚会。',
    officialEn: 'Crimson stars rose into the night, marking a Tarot Gathering that transcended reality.',
    strategyNotes: 'Atmospheric narrative cadence for mystical Beyonder rituals.'
  },

  // 3. A Will Eternal (一念永恒) - Deathblade / Wuxiaworld Style
  {
    id: 'awe-1',
    novelTitleZh: '一念永恒',
    novelTitleEn: 'A Will Eternal',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'wuxia',
    rawZh: '一念成沧海，一念化桑田。一念斩千魔，一念诛万仙！',
    officialEn: 'One will to create oceans. One will to summon the mulberry fields. One will to slaughter countless devils. One will to respond to eternity!',
    strategyNotes: 'Parallel poetic structure translated with repeating "One will to..." anaphora.'
  },
  {
    id: 'awe-2',
    novelTitleZh: '一念永恒',
    novelTitleEn: 'A Will Eternal',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'wuxia',
    rawZh: '白小纯握紧了手中的九香虫，眼神中透出一股对长生的执念。',
    officialEn: 'Bai Xiaochun gripped the Nine-Aroma Incense in his hand, a burning obsession with longevity flashing deep within his eyes.',
    strategyNotes: 'Character motivation description maintaining comedic/serious tone balance.'
  },

  // 4. Coiling Dragon (盘龙) - RenWoXing / Wuxiaworld Style
  {
    id: 'cd-1',
    novelTitleZh: '盘龙',
    novelTitleEn: 'Coiling Dragon',
    translator: 'RenWoXing (Wuxiaworld)',
    genre: 'xianxia',
    rawZh: '沧海桑田，岁月如梭。乌山镇依然静静屹立在魔兽山脉边缘。',
    officialEn: 'Time flows like water, and centuries pass in a flash. Wushan Town still stood quietly on the edge of the Mountain Range of Magical Beasts.',
    strategyNotes: 'Epic fantasy prologue prose translation.'
  }
];
