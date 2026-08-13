import { MULTI_CHAPTER_PARALLEL_CORPUS } from '../data/fullParallelCorpus';
import { INTERNAL_PARALLEL_CORPUS } from '../data/parallelCorpusData';

export type StylePresetId = 'xianxia-heroic' | 'dark-fantasy' | 'imperial-court' | 'modern-prose';

export interface StylePreset {
  id: StylePresetId;
  name: string;
  description: string;
  genre: string;
  samplePhraseZh: string;
  samplePhraseEn: string;
  toneGuidelines: string[];
}

export interface LearnedTranslationRule {
  id: string;
  category: 'Structure' | 'Honorifics' | 'Idioms' | 'Prose Flow' | 'Punctuation';
  patternZh: string;
  humanBenchmarkEn: string;
  explanation: string;
}

export interface AITrainingStats {
  totalParallelChapters: number;
  totalAlignedParagraphs: number;
  totalLearnedRules: number;
  activePresetId: StylePresetId;
}

const STORAGE_PRESET_KEY = 'trans_me_ai_style_preset_v1';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'xianxia-heroic',
    name: 'Xianxia & Cultivation (Heroic Epic)',
    description: 'High-energy, epic prose tailored for cultivation realms, martial techniques, and immortal ascension.',
    genre: 'Xianxia / Wuxia',
    samplePhraseZh: '三十年河东，三十年河西，莫欺少年穷！',
    samplePhraseEn: 'Thirty years east of the river, thirty years west; do not look down on a youth for being poor!',
    toneGuidelines: [
      'Preserve grand martial arts & technique names in Capitalized Words (e.g., Flame-Splitting Tsunami Cleaver).',
      'Translate cultivation ranks cleanly (e.g., Dou Disciple, Dou Practitioner, Dou Emperor).',
      'Emphasize high-rhythm action verbs during combat encounters.'
    ]
  },
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy & Mystery (Victorian / Eldritch)',
    description: 'Atmospheric, gothic prose with subtle suspense, suited for Lord of the Mysteries and horror fantasy.',
    genre: 'Fantasy / Mystery',
    samplePhraseZh: '克莱恩从沉眠中苏醒，绯红的月光穿透窗帘洒在书桌上。',
    samplePhraseEn: 'Klein awakened from a deep sleep as crimson moonlight filtered through the curtains onto his desk.',
    toneGuidelines: [
      'Use evocative Victorian vocabulary (e.g., crimson moonlight, ethereal whisper, Beyonder potion).',
      'Keep dialogue understated and atmospheric.',
      'Maintain mysterious, descriptive narrative cadence.'
    ]
  },
  {
    id: 'imperial-court',
    name: 'Imperial Court & Historical (Royal Elegance)',
    description: 'Refined, ornate prose respecting formal honorifics, palace intrigue, and classical idioms.',
    genre: 'Historical / Court',
    samplePhraseZh: '微臣遵旨，愿为陛下效犬马之劳。',
    samplePhraseEn: 'Your humble servant obeys the imperial decree and stands ready to serve Your Majesty with absolute devotion.',
    toneGuidelines: [
      'Strictly map formal royal pronouns (微臣 -> Your humble servant, 本宫 -> This Consort/Empress).',
      'Translate court titles with high elegance.',
      'Retain classical idiom subtext without clunky literalness.'
    ]
  },
  {
    id: 'modern-prose',
    name: 'Modern Urban & Comedy (Snappy Dialogue)',
    description: 'Fast-paced, modern vernacular with natural dialogue tags, humor, and clean sentence flow.',
    genre: 'Urban / Comedy',
    samplePhraseZh: '这家伙最喜欢扮猪吃老虎，当场打脸。',
    samplePhraseEn: 'This guy loves playing the fool to catch the tiger, slapping their faces on the spot.',
    toneGuidelines: [
      'Convert stiff literal phrases into natural English idioms.',
      'Keep dialogue tags snappy and conversational.',
      'Maintain high pace in action and banter scenes.'
    ]
  }
];

export const LEARNED_TRANSLATION_RULES: LearnedTranslationRule[] = [
  {
    id: 'lr-1',
    category: 'Idioms',
    patternZh: '倒吸一口凉气',
    humanBenchmarkEn: 'gasped in cold air',
    explanation: 'Translated as an atmospheric reaction phrase rather than literal "sucked back a mouthful of cool air".'
  },
  {
    id: 'lr-2',
    category: 'Structure',
    patternZh: '血肉横飞，惨叫连连',
    humanBenchmarkEn: 'one of the bloody casualties, amid horrific screams',
    explanation: 'Converts Chinese multi-verb parallel clauses into fluid English prepositional phrases.'
  },
  {
    id: 'lr-3',
    category: 'Honorifics',
    patternZh: '前辈 / 晚辈',
    humanBenchmarkEn: 'Senior / Junior',
    explanation: 'Preserves traditional cultivation hierarchy terms capitalized in English dialogue.'
  },
  {
    id: 'lr-4',
    category: 'Prose Flow',
    patternZh: '科技造物',
    humanBenchmarkEn: 'artificially engineered life-form',
    explanation: 'Expands shorthand Chinese tech terms into natural descriptive English sci-fi phrasing.'
  },
  {
    id: 'lr-5',
    category: 'Punctuation',
    patternZh: '“……”',
    humanBenchmarkEn: '"..."',
    explanation: 'Normalizes Chinese full-width ellipsis quotes into standard English dialogue punctuation.'
  }
];

export function getActiveStylePresetId(): StylePresetId {
  const saved = localStorage.getItem(STORAGE_PRESET_KEY);
  if (saved && (STYLE_PRESETS.some(p => p.id === saved))) {
    return saved as StylePresetId;
  }
  return 'xianxia-heroic';
}

export function setActiveStylePresetId(id: StylePresetId): void {
  localStorage.setItem(STORAGE_PRESET_KEY, id);
}

export function getAITrainingStats(): AITrainingStats {
  const multiChapterCount = MULTI_CHAPTER_PARALLEL_CORPUS.length;
  let totalParagraphs = 0;

  for (const c of MULTI_CHAPTER_PARALLEL_CORPUS) {
    totalParagraphs += c.alignedParagraphs.length;
  }

  totalParagraphs += INTERNAL_PARALLEL_CORPUS.length;

  return {
    totalParallelChapters: multiChapterCount,
    totalAlignedParagraphs: totalParagraphs,
    totalLearnedRules: LEARNED_TRANSLATION_RULES.length,
    activePresetId: getActiveStylePresetId()
  };
}

/**
 * Returns formatted training prompt guidelines to be injected into AI Translation requests.
 */
export function getActiveTrainingRulesPrompt(): string {
  const presetId = getActiveStylePresetId();
  const preset = STYLE_PRESETS.find(p => p.id === presetId) || STYLE_PRESETS[0];

  const rulesSummary = LEARNED_TRANSLATION_RULES.map(r => 
    `- [${r.category}] "${r.patternZh}" -> "${r.humanBenchmarkEn}" (${r.explanation})`
  ).join('\n');

  const presetGuidelines = preset.toneGuidelines.map(g => `- ${g}`).join('\n');

  return `LEARNED HUMAN TRANSLATION BENCHMARK RULES:
Active Style Preset: ${preset.name} (${preset.genre})
${presetGuidelines}

Extracted Human Translation Pattern Guidelines:
${rulesSummary}`;
}
