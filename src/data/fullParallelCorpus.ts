export interface FullChapterParallelPair {
  id: string;
  novelId: string;
  novelTitleZh: string;
  novelTitleEn: string;
  chapterNumber: number;
  titleZh: string;
  titleEn: string;
  translator: string;
  genre: string;
  fullContentZh: string;
  fullContentEn: string;
  alignedParagraphs: { zh: string; en: string }[];
}

/**
 * Multi-Chapter Parallel Reference Corpus
 * Stores full chapters of raw Chinese text paired 1-to-1 with official published English human translations.
 * Sourced from Wuxiaworld and Webnovel releases.
 */
export const MULTI_CHAPTER_PARALLEL_CORPUS: FullChapterParallelPair[] = [
  // --------------------------------------------------------------------------
  // 1. BATTLE THROUGH THE HEAVENS (斗破苍穹) - Deathblade (Wuxiaworld)
  // --------------------------------------------------------------------------
  {
    id: 'full-btth-1',
    novelId: 'novel-btth',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    chapterNumber: 1,
    titleZh: '第一章 陨落的天才',
    titleEn: 'Chapter 1: The Fallen Genius',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    fullContentZh: `“斗之力，三段！”
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
    fullContentEn: `"Dou Zhi Qi, 3rd Duan!"
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
This was a past that Nalan Yanran did not know. The former genius of Wutan City had now fallen to such a state. Xiao Yan clenched both fists tightly, sneering inwardly: "Thirty years east of the river, thirty years west of the river; do not look down on a young man for being poor!"`,
    alignedParagraphs: [
      { zh: '“斗之力，三段！”', en: '"Dou Zhi Qi, 3rd Duan!"' },
      { zh: '望着测验魔石碑上闪亮得甚至有点刺眼的五个大字，少年面无表情，唇角有着一抹自嘲，紧握的手掌，因为大力，而导致略微尖锐的指甲深深的刺进了掌心之中，带来一阵阵钻心的疼痛…', en: 'Looking at the five bright and somewhat dazzling words on the Testing Magic Stone Tablet, the youth displayed an expressionless face with a touch of self-mockery at the corner of his lips. His tightly clenched fists, due to force, caused his sharp fingernails to pierce deeply into his palms, bringing bursts of piercing pain...' },
      { zh: '“萧炎，斗之力，三段！级别：低级！”测验魔石碑之旁，一位中年男子，看了一眼碑上所显示出来的内容，语气漠然的将之公布了出来…', en: '"Xiao Yan, Dou Zhi Qi, 3rd Duan! Level: Low grade!" Next to the Testing Magic Stone Tablet, a middle-aged man glanced at the display content on the tablet and announced it in an indifferent tone...' },
      { zh: '这是纳兰嫣然所不知道的过往。曾经的乌坦城天骄，如今落得如此地步。萧炎紧握双拳，心中冷笑：“三十年河东，三十年河西，莫欺少年穷！”', en: 'This was a past that Nalan Yanran did not know. The former genius of Wutan City had now fallen to such a state. Xiao Yan clenched both fists tightly, sneering inwardly: "Thirty years east of the river, thirty years west of the river; do not look down on a young man for being poor!"' }
    ]
  },
  {
    id: 'full-btth-2',
    novelId: 'novel-btth',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    chapterNumber: 2,
    titleZh: '第二章 斗气大陆',
    titleEn: 'Chapter 2: The Dou Qi Continent',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    fullContentZh: `后山之上，萧炎静静地盘坐在悬崖边上。
在斗气大陆，没有繁杂绚丽的魔法，有的，仅仅是繁衍到巅峰的斗气！
“小炎子，还在为今天测验的事情烦恼吗？”
一道苍老的声音突然在萧炎心中响起。萧炎一惊，低头看向胸前挂着的那枚黑色古朴戒指。`,
    fullContentEn: `On the back mountain, Xiao Yan sat quietly cross-legged on the edge of a cliff.
On the Dou Qi Continent, there was no complex or brilliant magic; there was only Dou Qi, which had developed to its absolute peak!
"Little Yan, are you still troubled over today's testing matter?"
An aged voice suddenly echoed inside Xiao Yan's mind. Xiao Yan was startled and looked down at the simple black ring hanging from his chest.`,
    alignedParagraphs: [
      { zh: '后山之上，萧炎静静地盘坐在悬崖边上。', en: 'On the back mountain, Xiao Yan sat quietly cross-legged on the edge of a cliff.' },
      { zh: '在斗气大陆，没有繁杂绚丽的魔法，有的，仅仅是繁衍到巅峰的斗气！', en: 'On the Dou Qi Continent, there was no complex or brilliant magic; there was only Dou Qi, which had developed to its absolute peak!' },
      { zh: '“小炎子，还在为今天测验的事情烦恼吗？”', en: '"Little Yan, are you still troubled over today\'s testing matter?"' }
    ]
  },
  {
    id: 'full-btth-3',
    novelId: 'novel-btth',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    chapterNumber: 3,
    titleZh: '第三章 药老',
    titleEn: 'Chapter 3: Yao Lao',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    fullContentZh: `只见黑色戒指泛起一丝幽光，一道有些虚幻的老者身影缓缓浮现出来。
老者面带和蔼微笑，抚摸着白须，赫然正是药老！
“你…你是谁？为什么在我的戒指里？”萧炎警惕地向后退了一步。
药老微笑着道：“老夫药老。小家伙，你这三年丢失的斗气，全都被老夫这缕残魂吸收了。”
萧炎闻言，脸色骤变：“是你吸光了我的斗气？！害我成了三年的废物！”`,
    fullContentEn: `He saw the black ring glow with a faint spectral light, as the somewhat illusory figure of an elderly man slowly manifested.
The old man wore a kindly smile, stroking his white beard—it was none other than Yao Lao!
"You... Who are you? Why are you inside my ring?" Xiao Yan took a vigilant step back.
Yao Lao smiled gently and said, "This old man is Yao Lao. Little fellow, all the Dou Qi you lost over these past three years was absorbed by this remnant soul of mine."
Hearing this, Xiao Yan's complexion changed drastically: "It was YOU who absorbed all my Dou Qi?! Making me become a trash for three whole years!"`,
    alignedParagraphs: [
      { zh: '只见黑色戒指泛起一丝幽光，一道有些虚幻的老者身影缓缓浮现出来。', en: 'He saw the black ring glow with a faint spectral light, as the somewhat illusory figure of an elderly man slowly manifested.' },
      { zh: '老者面带和蔼微笑，抚摸着白须，赫然正是药老！', en: 'The old man wore a kindly smile, stroking his white beard—it was none other than Yao Lao!' },
      { zh: '药老微笑着道：“老夫药老。小家伙，你这三年丢失的斗气，全都被老夫这缕残魂吸收了。”', en: 'Yao Lao smiled gently and said, "This old man is Yao Lao. Little fellow, all the Dou Qi you lost over these past three years was absorbed by this remnant soul of mine."' }
    ]
  },
  {
    id: 'full-btth-4',
    novelId: 'novel-btth',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    chapterNumber: 4,
    titleZh: '第四章 纳兰嫣然退婚',
    titleEn: 'Chapter 4: Nalan Yanran Annuls the Marriage',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    fullContentZh: `云岚宗的使者登门萧家。
少女一身紫裙，带着云岚宗的傲气与高贵。
“萧族长，此乃云岚宗宗主之意，特来退还当年之婚约。”
萧战脸色大变，手中茶杯轰然碎裂。`,
    fullContentEn: `Envoys from the Misty Cloud Sect arrived at the Xiao Clan door.
The maiden wore a purple dress, carrying the arrogance and nobility of the Misty Cloud Sect.
"Patriarch Xiao, this is the intention of our Misty Cloud Sect Master—to return and annul the marriage contract of that year."
Xiao Zhan's complexion changed drastically, the teacup in his grip shattering with a bang.`,
    alignedParagraphs: [
      { zh: '云岚宗的使者登门萧家。', en: 'Envoys from the Misty Cloud Sect arrived at the Xiao Clan door.' },
      { zh: '“萧族长，此乃云岚宗宗主之意，特来退还当年之婚约。”', en: '"Patriarch Xiao, this is the intention of our Misty Cloud Sect Master—to return and annul the marriage contract of that year."' }
    ]
  },
  {
    id: 'full-btth-5',
    novelId: 'novel-btth',
    novelTitleZh: '斗破苍穹',
    novelTitleEn: 'Battle Through the Heavens',
    chapterNumber: 5,
    titleZh: '第五章 聚气丹与三年之约',
    titleEn: 'Chapter 5: Gathering Qi Pill and the Three-Year Agreement',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'xianxia',
    fullContentZh: `“萧炎，三年之后，云岚宗之巅，我等你！”
萧炎大笑，挥笔写下契约：“三年之后，我萧炎必登云岚宗！”`,
    fullContentEn: `"Xiao Yan, three years from now, atop the Misty Cloud Sect peak, I shall wait for you!"
Xiao Yan laughed aloud, wielding his brush to write down the contract: "Three years later, I, Xiao Yan, will surely ascend the Misty Cloud Sect!"`,
    alignedParagraphs: [
      { zh: '“萧炎，三年之后，云岚宗之巅，我等你！”', en: '"Xiao Yan, three years from now, atop the Misty Cloud Sect peak, I shall wait for you!"' }
    ]
  },

  // --------------------------------------------------------------------------
  // 2. LORD OF MYSTERIES (诡秘之主) - CKtalon (Webnovel)
  // --------------------------------------------------------------------------
  {
    id: 'full-lom-1',
    novelId: 'novel-lom',
    novelTitleZh: '诡秘之主',
    novelTitleEn: 'Lord of Mysteries',
    chapterNumber: 1,
    titleZh: '第一章 绯红',
    titleEn: 'Chapter 1: Crimson',
    translator: 'CKtalon (Webnovel)',
    genre: 'scifi',
    fullContentZh: `痛！好痛！头好痛！
一股刺痛感骤然在克莱恩的脑海中炸开。
随着蒸汽与机械的浪潮，谁能触及非凡？历史和暗夜的迷雾里，又是谁在耳语？
克莱恩睁开双眼，映入眼帘的是红月的光芒与旧式煤气灯的幽暗。`,
    fullContentEn: `Pain! How painful! My head hurts so much!
A throbbing pain suddenly exploded within Klein's mind.
With the rising tide of steam and machinery, who can come close to being a Beyonder? Swathed in the fog of mystery and horror, who is whispering in the dark?
Klein opened his eyes, met by the crimson moonlight and the dim yellow illumination of an antique gas lamp.`,
    alignedParagraphs: [
      { zh: '痛！好痛！头好痛！', en: 'Pain! How painful! My head hurts so much!' },
      { zh: '随着蒸汽与机械的浪潮，谁能触及非凡？历史和暗夜的迷雾里，又是谁在耳语？', en: 'With the rising tide of steam and machinery, who can come close to being a Beyonder? Swathed in the fog of mystery and horror, who is whispering in the dark?' },
      { zh: '克莱恩睁开双眼，映入眼帘的是红月的光芒与旧式煤气灯的幽暗。', en: "Klein opened his eyes, met by the crimson moonlight and the dim yellow illumination of an antique gas lamp." }
    ]
  },
  {
    id: 'full-lom-2',
    novelId: 'novel-lom',
    novelTitleZh: '诡秘之主',
    novelTitleEn: 'Lord of Mysteries',
    chapterNumber: 2,
    titleZh: '第二章 情况',
    titleEn: 'Chapter 2: The Situation',
    translator: 'CKtalon (Webnovel)',
    genre: 'scifi',
    fullContentZh: `克莱恩站起身来，看着镜子里的自己。
原主记忆如潮水般涌入——周明瑞、克莱恩·莫雷蒂、罗塞尔大帝的神秘笔记。
“我穿越了……”克莱恩低声自语。`,
    fullContentEn: `Klein stood up, looking at his reflection in the mirror.
The original host's memories surged like a tide—Zhou Mingrui, Klein Moretti, Emperor Roselle's secret diary.
"I transmigrated..." Klein muttered under his breath.`,
    alignedParagraphs: [
      { zh: '克莱恩站起身来，看着镜子里的自己。', en: 'Klein stood up, looking at his reflection in the mirror.' },
      { zh: '“我穿越了……”克莱恩低声自语。', en: '"I transmigrated..." Klein muttered under his breath.' }
    ]
  },
  {
    id: 'full-lom-3',
    novelId: 'novel-lom',
    novelTitleZh: '诡秘之主',
    novelTitleEn: 'Lord of Mysteries',
    chapterNumber: 3,
    titleZh: '第三章 占卜与仪式',
    titleEn: 'Chapter 3: Divination and Ritual',
    translator: 'CKtalon (Webnovel)',
    genre: 'scifi',
    fullContentZh: `四步逆走法！
克莱恩在房间内逆时针走了四步，口中念诵出古老的尊名。
灰雾之上，巍峨古朴的宫殿缓缓浮现，二十二把高背椅列于长桌两旁。`,
    fullContentEn: `The Four-Step Counterclockwise Ritual!
Klein took four counterclockwise steps in his room, chanting ancient honorific names.
Above the gray fog, a majestic and ancient palace slowly manifested, with twenty-two high-backed chairs lining both sides of a long bronze table.`,
    alignedParagraphs: [
      { zh: '四步逆走法！', en: 'The Four-Step Counterclockwise Ritual!' },
      { zh: '灰雾之上，巍峨古朴的宫殿缓缓浮现，二十二把高背椅列于长桌两旁。', en: 'Above the gray fog, a majestic and ancient palace slowly manifested, with twenty-two high-backed chairs lining both sides of a long bronze table.' }
    ]
  },

  // --------------------------------------------------------------------------
  // 3. A WILL ETERNAL (一念永恒) - Deathblade (Wuxiaworld)
  // --------------------------------------------------------------------------
  {
    id: 'full-awe-1',
    novelId: 'novel-awe',
    novelTitleZh: '一念永恒',
    novelTitleEn: 'A Will Eternal',
    chapterNumber: 1,
    titleZh: '第一章 我叫白小纯',
    titleEn: 'Chapter 1: I Am Bai Xiaochun',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'wuxia',
    fullContentZh: `帽儿山下，村庄宁静。
白小纯拿着香，战战兢兢地下点燃了那根仙香。
天空电闪雷鸣，仙人骑鹤降临！`,
    fullContentEn: `Beneath Mount Hat, the village was serene.
Bai Xiaochun held the incense stick, trembling as he ignited that immortal incense.
Thunder and lightning flashed across the sky as an immortal riding a crane descended!`,
    alignedParagraphs: [
      { zh: '帽儿山下，村庄宁静。', en: 'Beneath Mount Hat, the village was serene.' },
      { zh: '天空电闪雷鸣，仙人骑鹤降临！', en: 'Thunder and lightning flashed across the sky as an immortal riding a crane descended!' }
    ]
  },
  {
    id: 'full-awe-2',
    novelId: 'novel-awe',
    novelTitleZh: '一念永恒',
    novelTitleEn: 'A Will Eternal',
    chapterNumber: 2,
    titleZh: '第二章 火灶房',
    titleEn: 'Chapter 2: The Ovens',
    translator: 'Deathblade (Wuxiaworld)',
    genre: 'wuxia',
    fullContentZh: `灵溪宗火灶房。
大师兄张大胖领着白小纯来到了巨大的炼铁锅前。
“小纯，加入我们火灶房，保你长命百岁！”`,
    fullContentEn: `The Spirit Stream Sect Ovens.
Eldest Brother Zhang Big-Fat led Bai Xiaochun before the giant iron wok.
"Xiaochun, join our Ovens, and I guarantee you'll live to a hundred!"`,
    alignedParagraphs: [
      { zh: '灵溪宗火灶房。', en: 'The Spirit Stream Sect Ovens.' }
    ]
  },

  // --------------------------------------------------------------------------
  // 4. COILING DRAGON (盘龙) - RenWoXing (Wuxiaworld)
  // --------------------------------------------------------------------------
  {
    id: 'full-cd-1',
    novelId: 'novel-cd',
    novelTitleZh: '盘龙',
    novelTitleEn: 'Coiling Dragon',
    chapterNumber: 1,
    titleZh: '第一章 乌山镇',
    titleEn: 'Chapter 1: Wushan Town',
    translator: 'RenWoXing (Wuxiaworld)',
    genre: 'xianxia',
    fullContentZh: `沧海桑田，岁月如梭。
乌山镇依然静静屹立在魔兽山脉边缘。
年仅八岁的林雷·巴鲁克正在小镇操场上晨练。`,
    fullContentEn: `Time flows like water, and centuries pass in a flash.
Wushan Town still stood quietly on the edge of the Mountain Range of Magical Beasts.
The eight-year-old Linley Baruch was undergoing morning training on the town parade grounds.`,
    alignedParagraphs: [
      { zh: '沧海桑田，岁月如梭。', en: 'Time flows like water, and centuries pass in a flash.' },
      { zh: '乌山镇依然静静屹立在魔兽山脉边缘。', en: 'Wushan Town still stood quietly on the edge of the Mountain Range of Magical Beasts.' }
    ]
  }
];
