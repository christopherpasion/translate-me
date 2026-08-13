export type Genre = 
  | 'xianxia' 
  | 'wuxia' 
  | 'xuanhuan' 
  | 'historical' 
  | 'scifi' 
  | 'urban' 
  | 'romance' 
  | 'gaming' 
  | 'classical';

export type EntityCategory = 'character' | 'faction' | 'realm' | 'location' | 'item' | 'idiom';

export type Gender = 'male' | 'female' | 'non-binary' | 'unknown';

export type TermScope = 'local' | 'global';

export type ChineseScript = 'simplified' | 'traditional';

export interface GlossaryEntry {
  id: string;
  originalZh: string;
  translatedEn: string;
  category: EntityCategory;
  scope: TermScope; // 'local' = this novel only; 'global' = shared across all novels
  gender?: Gender;
  notes?: string;
  aliases?: string[]; // e.g. ["小炎子", "炎儿"]
  pinyin?: string; // e.g. "Xiāo Yán"
  traditionalZh?: string; // e.g. "蕭炎"
  etymology?: string;
  occurrences: number;
  updatedAt: string;
}

export interface DictionaryEntry {
  id: string;
  simplifiedZh: string;
  traditionalZh: string;
  pinyin: string;
  englishDefinition: string;
  category: EntityCategory;
  genreContext?: Genre;
  sampleZh?: string;
  sampleEn?: string;
  literalBreakdown?: string;
}

export interface SelfHealingRecord {
  id: string;
  chapterId: string;
  originalDraftText: string;
  autoHealedText: string;
  termZh: string;
  incorrectEn: string;
  correctedEn: string;
  timestamp: string;
}

export interface AIRecommendation {
  id: string;
  novelId: string;
  originalZh: string;
  suggestedEn: string;
  category: EntityCategory;
  reason: string; // e.g. "Detected frequent alias for Xiao Yan (萧炎)"
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ReaderSuggestion {
  id: string;
  novelId: string;
  chapterNumber: number;
  originalZh: string;
  currentEn: string;
  suggestedEn: string;
  submittedBy: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Chapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  titleZh: string;
  titleEn: string;
  contentZh: string;
  contentEn: string;
  status: 'raw' | 'extracting' | 'translated' | 'edited';
  extractedTermsCount: number;
  selfHealedCount: number;
  summary?: string;
  updatedAt: string;
}

export interface Novel {
  id: string;
  titleZh: string;
  titleEn: string;
  author: string;
  genre: Genre;
  coverGradient: string;
  description: string;
  chaptersCount: number;
  translatedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  lastUpdated: string;
}

export interface CharacterNode {
  id: string;
  nameZh: string;
  nameEn: string;
  role: 'protagonist' | 'deuteragonist' | 'antagonist' | 'supporting';
  realm?: string;
  faction?: string;
  gender: Gender;
}

export interface CharacterRelation {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string; // e.g. "Master-Disciple", "Rivals", "Lover", "Sectmate"
}
