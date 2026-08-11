import type { Novel, Chapter, GlossaryEntry, SelfHealingRecord, AIRecommendation, ReaderSuggestion } from '../types';

const NOVELS_KEY = 'trans_me_novels_v2';
const CHAPTERS_KEY = 'trans_me_chapters_v2';
const GLOSSARY_KEY = 'trans_me_glossary_v2';
const HEALING_KEY = 'trans_me_healing_v2';
const RECOMMENDATIONS_KEY = 'trans_me_recommendations_v2';
const SUGGESTIONS_KEY = 'trans_me_suggestions_v2';

// Initial Sample Novels
const INITIAL_NOVELS: Novel[] = [
  {
    id: 'novel-1',
    titleZh: '斗破苍穹',
    titleEn: 'Battle Through the Heavens',
    author: '天蚕土豆 (Heavenly Silkworm Potato)',
    genre: 'xianxia',
    coverGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: 'A land where no magic exists. Here, the strong make the rules and the weak must obey. A land filled with alluring treasures, yet also filled with unforeseen danger.',
    chaptersCount: 3,
    translatedCount: 2,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-11T12:00:00Z'
  },
  {
    id: 'novel-2',
    titleZh: '诡秘之主',
    titleEn: 'Lord of Mysteries',
    author: '爱潜水的乌贼 (Cuttlefish That Loves Diving)',
    genre: 'scifi',
    coverGradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    description: 'With the rising tide of steam and machinery, who can come close to being a Beyonder? Swathed in the fog of mystery and horror, Klein Moretti awakens in a new world.',
    chaptersCount: 2,
    translatedCount: 1,
    createdAt: '2026-08-05T14:00:00Z',
    updatedAt: '2026-08-10T15:30:00Z'
  },
  {
    id: 'novel-3',
    titleZh: '一念永恒',
    titleEn: 'A Will Eternal',
    author: '耳根 (Er Gen)',
    genre: 'wuxia',
    coverGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: 'One will to create oceans. One will to summon the mulberry fields. One will to slaughter countless devils. One will to respond to eternity!',
    chaptersCount: 1,
    translatedCount: 1,
    createdAt: '2026-08-08T09:00:00Z',
    updatedAt: '2026-08-11T08:00:00Z'
  }
];

// Initial Global Master Glossary (Shared across all Xianxia/Wuxia novels)
const INITIAL_GLOBAL_GLOSSARY: GlossaryEntry[] = [
  {
    id: 'global-1',
    originalZh: '丹田',
    translatedEn: 'Dantian',
    category: 'realm',
    scope: 'global',
    notes: 'Energy center located below the navel',
    occurrences: 142,
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'global-2',
    originalZh: '天劫',
    translatedEn: 'Heavenly Tribulation',
    category: 'realm',
    scope: 'global',
    notes: 'Lightning trial sent by the heavens during breakthrough',
    occurrences: 89,
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'global-3',
    originalZh: '道侣',
    translatedEn: 'Dao Companion',
    category: 'character',
    scope: 'global',
    notes: 'Cultivation partner',
    occurrences: 54,
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'global-4',
    originalZh: '储物戒',
    translatedEn: 'Storage Ring',
    category: 'item',
    scope: 'global',
    notes: 'Ring containing pocket spatial dimension',
    occurrences: 110,
    updatedAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'global-5',
    originalZh: '三十年河东，三十年河西',
    translatedEn: 'Thirty years east of the river, thirty years west of the river',
    category: 'idiom',
    scope: 'global',
    notes: 'Popular idiom: Fortunes change over time, don\'t look down on youth',
    occurrences: 12,
    updatedAt: '2026-08-01T00:00:00Z'
  }
];

// Initial Novel Glossaries
const INITIAL_LOCAL_GLOSSARY: GlossaryEntry[] = [
  // Battle Through the Heavens (novel-1)
  {
    id: 'g-101',
    originalZh: '萧炎',
    translatedEn: 'Xiao Yan',
    category: 'character',
    scope: 'local',
    gender: 'male',
    notes: 'Protagonist of Battle Through the Heavens',
    aliases: ['小炎子', '炎儿'],
    occurrences: 65,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-102',
    originalZh: '熏儿',
    translatedEn: 'Xun Er',
    category: 'character',
    scope: 'local',
    gender: 'female',
    notes: 'Gu Clan prodigy and Xiao Yan\'s childhood partner',
    occurrences: 32,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-103',
    originalZh: '药老',
    translatedEn: 'Yao Lao',
    category: 'character',
    scope: 'local',
    gender: 'male',
    notes: 'Master trapped inside the black ring, former Alchemy Venerable',
    occurrences: 48,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-104',
    originalZh: '纳兰嫣然',
    translatedEn: 'Nalan Yanran',
    category: 'character',
    scope: 'local',
    gender: 'female',
    notes: 'Young mistress of Misty Cloud Sect who broke the marriage contract',
    occurrences: 19,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-105',
    originalZh: '云岚宗',
    translatedEn: 'Misty Cloud Sect',
    category: 'faction',
    scope: 'local',
    notes: 'Dominant martial sect in Jia Ma Empire',
    occurrences: 28,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-106',
    originalZh: '斗者',
    translatedEn: 'Dou Zhe (Fighter)',
    category: 'realm',
    scope: 'local',
    notes: 'First official rank of Dou Qi cultivation',
    occurrences: 15,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-107',
    originalZh: '斗帝',
    translatedEn: 'Dou Emperor',
    category: 'realm',
    scope: 'local',
    notes: 'Pinnacle level of Dou Qi continent',
    occurrences: 8,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-108',
    originalZh: '焰分噬浪尺',
    translatedEn: 'Flame Splitting Tsunami Ruler',
    category: 'item',
    scope: 'local',
    notes: 'Di-class Xuan martial skill taught by Yao Lao',
    occurrences: 6,
    updatedAt: '2026-08-01T12:00:00Z'
  },
  {
    id: 'g-109',
    originalZh: '乌坦城',
    translatedEn: 'Wutan City',
    category: 'location',
    scope: 'local',
    notes: 'Starting hometown of Xiao family',
    occurrences: 21,
    updatedAt: '2026-08-01T12:00:00Z'
  }
];

// Initial Chapters
const INITIAL_CHAPTERS: Chapter[] = [
  {
    id: 'chap-1-1',
    novelId: 'novel-1',
    chapterNumber: 1,
    titleZh: '第一章 陨落的天才',
    titleEn: 'Chapter 1: The Fallen Genius',
    status: 'translated',
    extractedTermsCount: 9,
    selfHealedCount: 3,
    summary: 'Xiao Yan tests his Dou Qi level at age 15 and is ridiculed for dropping to Dou Zhi Qi 3rd Duan.',
    updatedAt: '2026-08-11T12:00:00Z',
    contentZh: `“斗之力，三段！”

望着测验魔石碑上闪亮得甚至有点刺眼的五个大字，少年面无表情，唇角有着一抹自嘲，紧握的手掌，因为大力，而导致略微尖锐的指甲深深的刺进了掌心之中，带来一阵阵钻心的疼痛…

“萧炎，斗之力，三段！级别：低级！”测验魔石碑之旁，一位中年男子，看了一眼碑上所显示出来的内容，语气漠然的将之公布了出来…

中年男子话刚刚脱口，便是不不出意外的在人头涌动的广场上带起了一阵嘲讽的骚动。

“三段？嘿嘿，果然不出我所料，这个‘天才’这一年又是在原地踏步！”
“哎，这废物真是把萧家的脸都丢光了。”
“要不是族长是他的父亲，这种废物早被驱逐出家族了，哪里还有资格待在族里。”

周围传来的不屑嘲笑以及惋惜叹息，落在那孤单的少年耳朵里，犹如一把把重锤重重的砸在心口，令得少年呼吸有些急促。

少年缓缓抬起头来，露出一张有些稚嫩的清秀脸庞，黑色头发贴着额头，黑色的双眸中此时却是充斥着自嘲与不屈。

“萧炎哥…”就在少年准备转身离开时，一道犹如清泉般的娇柔声音突然传了过来。
萧炎停下脚步，转过身，看着迎面走来的少女。少女一身紫裙，气质清冷脱俗，精致的面庞带着一丝关切。

这是纳兰嫣然所不知道的过往。曾经的乌坦城天骄，如今落得如此地步。萧炎紧握双拳，心中冷笑：“三十年河东，三十年河西，莫欺少年穷！”`,
    contentEn: `"Dou Zhi Qi, 3rd Duan!"

Looking at the five bright and somewhat dazzling words on the Testing Magic Stone Tablet, the youth displayed an expressionless face with a touch of self-mockery at the corner of his lips. His tightly clenched fists, due to force, caused his sharp fingernails to pierce deeply into his palms, bringing bursts of piercing pain...

"Xiao Yan, Dou Zhi Qi, 3rd Duan! Level: Low grade!" Next to the Testing Magic Stone Tablet, a middle-aged man glanced at the display content on the tablet and announced it in an indifferent tone...

As soon as the middle-aged man's words left his mouth, as expected, a commotion of ridicule immediately surged through the crowded plaza.

"3rd Duan? Hehe, just as I expected, this 'genius' has been standing still at the same spot for another year!"
"Sigh, this trash really threw away all the face of the Xiao Family."
"If the Patriarch weren't his father, such a useless trash would have been expelled from the family long ago. How could he still have the qualification to stay in the clan?"

The surrounding contemptuous laughter and regretful sighs fell into the lonely youth's ears like heavy hammers pounding on his chest, making the youth's breathing somewhat ragged.

The youth slowly raised his head, revealing a somewhat immature, delicate, and handsome face. Black hair rested against his forehead, and his dark eyes were currently filled with self-mockery and unyielding determination.

"Brother Xiao Yan..." Just as the youth prepared to turn and leave, a gentle voice like a clear spring suddenly arrived.
Xiao Yan paused his steps, turned around, and looked at the young maiden walking toward him. The maiden wore a purple dress, possessing a refined and ethereal aura, her exquisite face carrying a hint of deep concern.

This was a past that Nalan Yanran did not know. The former genius of Wutan City had now fallen to such a state. Xiao Yan clenched both fists tightly, sneering inwardly: "Thirty years east of the river, thirty years west of the river; do not look down on a young man for being poor!"`
  },
  {
    id: 'chap-1-2',
    novelId: 'novel-1',
    chapterNumber: 2,
    titleZh: '第二章 斗气大陆',
    titleEn: 'Chapter 2: The Dou Qi Continent',
    status: 'translated',
    extractedTermsCount: 7,
    selfHealedCount: 1,
    summary: 'Explains the laws of Dou Qi Continent and introduces Yao Lao inside the ring.',
    updatedAt: '2026-08-11T12:30:00Z',
    contentZh: `后山之上，萧炎静静地盘坐在悬崖边上。

在斗气大陆，没有繁杂绚丽的魔法，有的，仅仅是繁衍到巅峰的斗气！

“小炎子，还在为今天测验的事情烦恼吗？”

一道苍老的声音突然在萧炎心中响起。萧炎一惊，低头看向胸前挂着的那枚黑色古朴戒指。

只见黑色戒指泛起一丝幽光，一道有些虚幻的老者身影缓缓浮现出来。老者面带和蔼微笑，抚摸着白须，赫然正是药老！

“你…你是谁？为什么在我的戒指里？”萧炎警惕地向后退了一步。

药老微笑着道：“老夫药老。小家伙，你这三年丢失的斗气，全都被老夫这缕残魂吸收了。”

萧炎闻言，脸色骤变：“是你吸光了我的斗气？！害我成了三年的废物！”`,
    contentEn: `On the back mountain, Xiao Yan sat quietly cross-legged on the edge of a cliff.

On the Dou Qi Continent, there was no complex or brilliant magic; there was only Dou Qi, which had developed to its absolute peak!

"Little Yan, are you still troubled over today's testing matter?"

An aged voice suddenly echoed inside Xiao Yan's mind. Xiao Yan was startled and looked down at the simple black ring hanging from his chest.

He saw the black ring glow with a faint spectral light, as the somewhat illusory figure of an elderly man slowly manifested. The old man wore a kindly smile, stroking his white beard — it was none other than Yao Lao!

"You... Who are you? Why are you inside my ring?" Xiao Yan took a vigilant step back.

Yao Lao smiled gently and said, "This old man is Yao Lao. Little fellow, all the Dou Qi you lost over these past three years was absorbed by this remnant soul of mine."

Hearing this, Xiao Yan's complexion changed drastically: "It was YOU who absorbed all my Dou Qi?! Making me become a trash for three whole years!"`
  }
];

// Initial Self-Healing Records
const INITIAL_HEALING: SelfHealingRecord[] = [
  {
    id: 'heal-1',
    chapterId: 'chap-1-1',
    originalDraftText: 'Little Flame, Dou Zhi Qi 3rd Duan!',
    autoHealedText: 'Xiao Yan, Dou Zhi Qi 3rd Duan!',
    termZh: '萧炎',
    incorrectEn: 'Little Flame',
    correctedEn: 'Xiao Yan',
    timestamp: '2026-08-11T12:01:00Z'
  },
  {
    id: 'heal-2',
    chapterId: 'chap-1-1',
    originalDraftText: 'Cloud Mist Sect mistress',
    autoHealedText: 'Misty Cloud Sect mistress',
    termZh: '云岚宗',
    incorrectEn: 'Cloud Mist Sect',
    correctedEn: 'Misty Cloud Sect',
    timestamp: '2026-08-11T12:01:05Z'
  }
];

// Initial AI Recommendations
const INITIAL_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec-1',
    novelId: 'novel-1',
    originalZh: '小炎子',
    suggestedEn: 'Little Yan',
    category: 'character',
    reason: 'Detected frequent affectionate nickname used by Yao Lao for Xiao Yan (萧炎). Auto-link alias.',
    status: 'pending'
  },
  {
    id: 'rec-2',
    novelId: 'novel-1',
    originalZh: '斗之气',
    suggestedEn: 'Dou Zhi Qi',
    category: 'realm',
    reason: 'Found preliminary stage of Dou Qi cultivation prior to Dou Zhe rank.',
    status: 'pending'
  }
];

// Initial Reader Suggestions
const INITIAL_SUGGESTIONS: ReaderSuggestion[] = [
  {
    id: 'sug-1',
    novelId: 'novel-1',
    chapterNumber: 1,
    originalZh: '云岚宗',
    currentEn: 'Misty Cloud Sect',
    suggestedEn: 'Cloud Mist Sect',
    submittedBy: 'DaoistReader_99',
    reason: 'Literal translation sounds more majestic in chapter 1 context.',
    status: 'pending',
    createdAt: '2026-08-11T13:00:00Z'
  }
];

export const StorageService = {
  getNovels(): Novel[] {
    const data = localStorage.getItem(NOVELS_KEY);
    if (!data) {
      localStorage.setItem(NOVELS_KEY, JSON.stringify(INITIAL_NOVELS));
      return INITIAL_NOVELS;
    }
    return JSON.parse(data);
  },

  saveNovel(novel: Novel): Novel[] {
    const list = this.getNovels();
    const idx = list.findIndex(n => n.id === novel.id);
    if (idx >= 0) {
      list[idx] = novel;
    } else {
      list.unshift(novel);
    }
    localStorage.setItem(NOVELS_KEY, JSON.stringify(list));
    return list;
  },

  deleteNovel(id: string): Novel[] {
    const list = this.getNovels().filter(n => n.id !== id);
    localStorage.setItem(NOVELS_KEY, JSON.stringify(list));
    return list;
  },

  getChapters(novelId: string): Chapter[] {
    const data = localStorage.getItem(CHAPTERS_KEY);
    let all: Chapter[] = data ? JSON.parse(data) : INITIAL_CHAPTERS;
    if (!data) {
      localStorage.setItem(CHAPTERS_KEY, JSON.stringify(INITIAL_CHAPTERS));
    }
    return all.filter(c => c.novelId === novelId).sort((a, b) => a.chapterNumber - b.chapterNumber);
  },

  saveChapter(chapter: Chapter): Chapter {
    const data = localStorage.getItem(CHAPTERS_KEY);
    let all: Chapter[] = data ? JSON.parse(data) : INITIAL_CHAPTERS;
    const idx = all.findIndex(c => c.id === chapter.id);
    if (idx >= 0) {
      all[idx] = chapter;
    } else {
      all.push(chapter);
    }
    localStorage.setItem(CHAPTERS_KEY, JSON.stringify(all));

    // Update novel counters
    const novels = this.getNovels();
    const novel = novels.find(n => n.id === chapter.novelId);
    if (novel) {
      const novelChaps = all.filter(c => c.novelId === chapter.novelId);
      novel.chaptersCount = novelChaps.length;
      novel.translatedCount = novelChaps.filter(c => c.status === 'translated' || c.status === 'edited').length;
      novel.updatedAt = new Date().toISOString();
      this.saveNovel(novel);
    }

    return chapter;
  },

  getGlossary(novelId?: string): GlossaryEntry[] {
    const data = localStorage.getItem(GLOSSARY_KEY);
    let all: GlossaryEntry[];
    if (!data) {
      all = [...INITIAL_GLOBAL_GLOSSARY, ...INITIAL_LOCAL_GLOSSARY];
      localStorage.setItem(GLOSSARY_KEY, JSON.stringify(all));
    } else {
      all = JSON.parse(data);
    }

    if (!novelId) {
      return all; // Return all entries (Global + all Locals)
    }

    // 2-Tier Priority: Local novel entries + Global entries
    return all.filter(g => g.scope === 'global' || g.id.startsWith(`g-${novelId}`) || g.id.includes(novelId));
  },

  saveGlossaryEntry(entry: GlossaryEntry): GlossaryEntry[] {
    const data = localStorage.getItem(GLOSSARY_KEY);
    let all: GlossaryEntry[] = data ? JSON.parse(data) : [...INITIAL_GLOBAL_GLOSSARY, ...INITIAL_LOCAL_GLOSSARY];
    
    const idx = all.findIndex(g => g.id === entry.id || g.originalZh === entry.originalZh);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...entry, updatedAt: new Date().toISOString() };
    } else {
      all.unshift({ ...entry, updatedAt: new Date().toISOString() });
    }

    localStorage.setItem(GLOSSARY_KEY, JSON.stringify(all));
    return all;
  },

  deleteGlossaryEntry(id: string): GlossaryEntry[] {
    const data = localStorage.getItem(GLOSSARY_KEY);
    let all: GlossaryEntry[] = data ? JSON.parse(data) : [...INITIAL_GLOBAL_GLOSSARY, ...INITIAL_LOCAL_GLOSSARY];
    all = all.filter(g => g.id !== id);
    localStorage.setItem(GLOSSARY_KEY, JSON.stringify(all));
    return all;
  },

  getHealingRecords(chapterId?: string): SelfHealingRecord[] {
    const data = localStorage.getItem(HEALING_KEY);
    let all: SelfHealingRecord[] = data ? JSON.parse(data) : INITIAL_HEALING;
    if (!data) localStorage.setItem(HEALING_KEY, JSON.stringify(INITIAL_HEALING));
    return chapterId ? all.filter(h => h.chapterId === chapterId) : all;
  },

  addHealingRecord(record: SelfHealingRecord): void {
    const all = this.getHealingRecords();
    all.unshift(record);
    localStorage.setItem(HEALING_KEY, JSON.stringify(all));
  },

  getAIRecommendations(novelId: string): AIRecommendation[] {
    const data = localStorage.getItem(RECOMMENDATIONS_KEY);
    let all: AIRecommendation[] = data ? JSON.parse(data) : INITIAL_RECOMMENDATIONS;
    if (!data) localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(INITIAL_RECOMMENDATIONS));
    return all.filter(r => r.novelId === novelId);
  },

  updateRecommendationStatus(id: string, status: 'accepted' | 'rejected'): void {
    const data = localStorage.getItem(RECOMMENDATIONS_KEY);
    let all: AIRecommendation[] = data ? JSON.parse(data) : INITIAL_RECOMMENDATIONS;
    const item = all.find(r => r.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(all));
    }
  },

  getReaderSuggestions(novelId: string): ReaderSuggestion[] {
    const data = localStorage.getItem(SUGGESTIONS_KEY);
    let all: ReaderSuggestion[] = data ? JSON.parse(data) : INITIAL_SUGGESTIONS;
    if (!data) localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(INITIAL_SUGGESTIONS));
    return all.filter(s => s.novelId === novelId);
  },

  saveReaderSuggestion(sug: ReaderSuggestion): ReaderSuggestion[] {
    const data = localStorage.getItem(SUGGESTIONS_KEY);
    let all: ReaderSuggestion[] = data ? JSON.parse(data) : INITIAL_SUGGESTIONS;
    all.unshift(sug);
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(all));
    return all.filter(s => s.novelId === sug.novelId);
  },

  updateSuggestionStatus(id: string, status: 'approved' | 'rejected'): void {
    const data = localStorage.getItem(SUGGESTIONS_KEY);
    let all: ReaderSuggestion[] = data ? JSON.parse(data) : INITIAL_SUGGESTIONS;
    const item = all.find(s => s.id === id);
    if (item) {
      item.status = status;
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(all));
    }
  }
};
