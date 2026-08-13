import type { DictionaryEntry, Genre } from '../types';
import { EXTENDED_DICTIONARY_DATA } from '../data/chineseDictionaryData';

/**
 * Master Chinese-English Dictionary Database
 * Built-in dictionary containing cultivation terms, honorifics, idioms (Chengyu), and vocabulary.
 */
export const MASTER_DICTIONARY: DictionaryEntry[] = [
  ...EXTENDED_DICTIONARY_DATA
];

export function searchDictionary(query: string, genre?: Genre): DictionaryEntry[] {
  if (!query || !query.trim()) {
    return genre ? MASTER_DICTIONARY.filter(d => !d.genreContext || d.genreContext === genre) : MASTER_DICTIONARY;
  }

  const q = query.trim().toLowerCase();

  return MASTER_DICTIONARY.filter(entry => {
    const matchSimplified = entry.simplifiedZh.includes(q);
    const matchTraditional = entry.traditionalZh.includes(q);
    const matchPinyin = entry.pinyin.toLowerCase().includes(q);
    const matchEnglish = entry.englishDefinition.toLowerCase().includes(q);
    const matchCategory = entry.category.toLowerCase().includes(q);

    return matchSimplified || matchTraditional || matchPinyin || matchEnglish || matchCategory;
  });
}

export function findDictionaryEntry(termZh: string): DictionaryEntry | undefined {
  if (!termZh) return undefined;
  return MASTER_DICTIONARY.find(d => d.simplifiedZh === termZh || d.traditionalZh === termZh);
}
