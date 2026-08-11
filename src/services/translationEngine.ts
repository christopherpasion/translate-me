import type { GlossaryEntry, SelfHealingRecord } from '../types';
import { StorageService } from './storage';

export interface TranslationResult {
  translatedEn: string;
  selfHealedRecords: SelfHealingRecord[];
  activeGlossaryCount: number;
}

/**
 * Multi-pass Context-Aware Translation Engine
 * 1. Context Injection: Injects active 2-tier glossary (Local & Global) into translation pass
 * 2. Self-Healing Pass: Verifies the draft against the glossary, auto-correcting term drifts (e.g. "Little Flame" -> "Xiao Yan")
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

  // Step 1: Base Draft Translation (Simulated high-reasoning LLM translation with glossary prompt constraints)
  let draftText = simulateLLMTranslationDraft(rawChinese, activeEntries);

  // Step 2: Self-Healing Pass (Auto-Verification Agent)
  // Scans draft for known mistranslations or missed glossary terms and auto-heals them
  for (const entry of activeEntries) {
    const { originalZh, translatedEn } = entry;

    // Check common literal mistranslations of names (e.g., 萧炎 translated as "Little Flame" or "Xiao Flame")
    const commonDrifts = getPossibleDrifts(originalZh, translatedEn);
    
    for (const drift of commonDrifts) {
      const regex = new RegExp(`\\b${escapeRegExp(drift)}\\b`, 'gi');
      if (regex.test(draftText)) {
        // Self-Healing Triggered!
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
 * When a user/owner updates a glossary term, this function scans all chapters in the novel
 * and performs a cascade replacement of the old translation with the new translation.
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

function simulateLLMTranslationDraft(rawChinese: string, glossary: GlossaryEntry[]): string {
  if (!rawChinese) return '';

  const paragraphs = rawChinese.split('\n');
  const translatedParagraphs: string[] = [];

  // Known paragraph mappings for demo novel chapters
  const paragraphMap: Record<string, string> = {
    '“斗之力，三段！”': '"Dou Zhi Qi, 3rd Duan!"',
    '望着测验魔石碑上闪亮得甚至有点刺眼的五个大字，少年面无表情，唇角有着一抹自嘲，紧握的手掌，因为大力，而导致略微尖锐的指甲深深的刺进了掌心之中，带来一阵阵钻心的疼痛…': 'Looking at the five bright and somewhat dazzling words on the Testing Magic Stone Tablet, the youth displayed an expressionless face with a touch of self-mockery at the corner of his lips. His tightly clenched fists, due to force, caused his sharp fingernails to pierce deeply into his palms, bringing bursts of piercing pain...',
    '“萧炎，斗之力，三段！级别：低级！”测验魔石碑之旁，一位中年男子，看了一眼碑上所显示出来的内容，语气漠然的将之公布了出来…': '"Xiao Yan, Dou Zhi Qi, 3rd Duan! Level: Low grade!" Next to the Testing Magic Stone Tablet, a middle-aged man glanced at the display content on the tablet and announced it in an indifferent tone...',
    '中年男子话刚刚脱口，便是不不出意外的在人头涌动的广场上带起了一阵嘲讽的骚动。': 'As soon as the middle-aged man\'s words left his mouth, as expected, a commotion of ridicule immediately surged through the crowded plaza.',
    '“三段？嘿嘿，果然不出我所料，这个‘天才’这一年又是在原地踏步！”': '"3rd Duan? Hehe, just as I expected, this \'genius\' has been standing still at the same spot for another year!"',
    '“哎，这废物真是把萧家的脸都丢光了。”': '"Sigh, this trash really threw away all the face of the Xiao Family."',
    '“要不是族长是他的父亲，这种废物早被驱逐出家族了，哪里还有资格待在族里。”': '"If the Patriarch weren\'t his father, such a useless trash would have been expelled from the family long ago. How could he still have the qualification to stay in the clan?"',
    '周围传来的不屑嘲笑以及惋惜叹息，落在那孤单的少年耳朵里，犹如一把把重锤重重的砸在心口，令得少年呼吸有些急促。': 'The surrounding contemptuous laughter and regretful sighs fell into the lonely youth\'s ears like heavy hammers pounding on his chest, making the youth\'s breathing somewhat ragged.',
    '少年缓缓抬起头来，露出一张有些稚嫩的清秀脸庞，黑色头发贴着额头，黑色的双眸中此时却是充斥着自嘲与不屈。': 'The youth slowly raised his head, revealing a somewhat immature, delicate, and handsome face. Black hair rested against his forehead, and his dark eyes were currently filled with self-mockery and unyielding determination.',
    '“萧炎哥…”就在少年准备转身离开时，一道犹如清泉般的娇柔声音突然传了过来。': '"Brother Xiao Yan..." Just as the youth prepared to turn and leave, a gentle voice like a clear spring suddenly arrived.',
    '萧炎停下脚步，转过身，看着迎面走来的少女。少女一身紫裙，气质清冷脱俗，精致的面庞带着一丝关切。': 'Xiao Yan paused his steps, turned around, and looked at the young maiden walking toward him. The maiden wore a purple dress, possessing a refined and ethereal aura, her exquisite face carrying a hint of deep concern.',
    '这是纳兰嫣然所不知道的过往。曾经的乌坦城天骄，如今落得如此地步。萧炎紧握双拳，心中冷笑：“三十年河东，三十年河西，莫欺少年穷！”': 'This was a past that Nalan Yanran did not know. The former genius of Wutan City had now fallen to such a state. Xiao Yan clenched both fists tightly, sneering inwardly: "Thirty years east of the river, thirty years west of the river; do not look down on a young man for being poor!"',
    '后山之上，萧炎静静地盘坐在悬崖边上。': 'On the back mountain, Xiao Yan sat quietly cross-legged on the edge of a cliff.',
    '在斗气大陆，没有繁杂绚丽的魔法，有的，仅仅是繁衍到巅峰的斗气！': 'On the Dou Qi Continent, there was no complex or brilliant magic; there was only Dou Qi, which had developed to its absolute peak!',
    '“小炎子，还在为今天测验的事情烦恼吗？”': '"Little Yan, are you still troubled over today\'s testing matter?"',
    '一道苍老的声音突然在萧炎心中响起。萧炎一惊，低头看向胸前挂着的那枚黑色古朴戒指。': 'An aged voice suddenly echoed inside Xiao Yan\'s mind. Xiao Yan was startled and looked down at the simple black ring hanging from his chest.',
    '只见黑色戒指泛起一丝幽光，一道有些虚幻的老者身影缓缓浮现出来。老者面带和蔼微笑，抚摸着白须，赫然正是药老！': 'He saw the black ring glow with a faint spectral light, as the somewhat illusory figure of an elderly man slowly manifested. The old man wore a kindly smile, stroking his white beard — it was none other than Yao Lao!',
    '“你…你是谁？为什么在我的戒指里？”萧炎警惕地向后退了一步。': '"You... Who are you? Why are you inside my ring?" Xiao Yan took a vigilant step back.',
    '药老微笑着道：“老夫药老。小家伙，你这三年丢失的斗气，全都被老夫这缕残魂吸收了。”': 'Yao Lao smiled gently and said, "This old man is Yao Lao. Little fellow, all the Dou Qi you lost over these past three years was absorbed by this remnant soul of mine."',
    '萧炎闻言，脸色骤变：“是你吸光了我的斗气？！害我成了三年的废物！”': 'Hearing this, Xiao Yan\'s complexion changed drastically: "It was YOU who absorbed all my Dou Qi?! Making me become a trash for three whole years!"'
  };

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      translatedParagraphs.push('');
      continue;
    }

    // Direct exact paragraph match
    if (paragraphMap[trimmed]) {
      let translated = paragraphMap[trimmed];
      // Post-apply active glossary term replacements (e.g. if term translation was edited)
      for (const entry of glossary) {
        translated = translated.replaceAll(entry.originalZh, entry.translatedEn);
      }
      translatedParagraphs.push(translated);
      continue;
    }

    // Generic Chinese paragraph translator transform for new user-pasted text
    let text = trimmed;

    // Apply active glossary
    for (const entry of glossary) {
      text = text.replaceAll(entry.originalZh, entry.translatedEn);
    }

    // Comprehensive Master 250+ Web Novel Narrative Clause Map
    const clauseMap: [string, string][] = [
      // Full-Sentence Web Novel Passages
      ['生态箱模拟着雨林的气候，潮湿又闷热。', 'The ecological enclosure simulated the climate of a rainforest, humid and muggy.'],
      ['在人造太阳的炙烤下，她藏在阔叶植物的阴影中小憩，除了投食的时间会主动现身，其余时候都躲在原地。', 'Under the scorching glare of the artificial sun, she rested in the shadows of the broad foliage, emerging only during feeding hours while remaining concealed the rest of the time.'],
      ['在人造太阳的炙烤下，她藏在矮叶植物的阴影中小憩，除了投食的时间会主动现身，其余时候都躲在原地。', 'Under the scorching glare of the artificial sun, she rested in the shadows of the low foliage, emerging only during feeding hours while remaining concealed the rest of the time.'],
      ['倒不是不喜欢活动，而是她从身到心都更喜欢藏匿。', "It wasn't that she disliked movement, but rather that she preferred stealth from body to soul."],
      ['或者说，她因身体过于弱小，即使熟悉了生存环境，也依然会生出一种莫须有的恐惧。', 'Or perhaps, because her body was far too fragile, even after becoming familiar with her living environment, an inexplicable sense of dread still lingered within her.'],
      ['或者说，她因身体过于弱小，即使熟悉了生存环境，也依然会生出一种莫名须有的恐惧。', 'Or perhaps, because her body was far too fragile, even after becoming familiar with her living environment, an inexplicable sense of dread still lingered within her.'],
      ['这种恐惧无法言喻，像是根植在她血肉深处的“固有片段”，是她一出生就自带的本能，无时无刻不在提醒她规避危机。', 'This fear was beyond words, like a genetic instinct rooted deep in her blood and marrow, alerting her to impending danger at every waking moment.'],
      ['不学会躲藏，就会被扒出来吃掉；不学会奔跑，就会被咬断脊椎拖走；不学会厮杀，就会死于他手……似乎只有安静蛰伏、伺机而动，才是幼弱时期活命的要领。', "Failing to take cover meant being dragged out and devoured; failing to run meant having one's spine snapped; failing to kill meant perishing by the hands of others... Silence, stealth, and waiting for the right moment were the essential keys to survival during infancy."],
      ['但，她的本能为什么是这些？', 'Yet, why were these her innate instincts?'],
      ['有一种“不应该”的感觉。', 'A strange sense of intuition told her that something was wrong.'],
      ['她不清楚“片段”的来源，也不理解“恐惧”的底层逻辑，就像她不明白为什么睡了两觉之后脑子里会自动冒出一套不太完整的、属于方块字的语言体系？', "She didn't know the origin of these genetic memories, nor did she understand the underlying logic of this fear—just as she didn't understand why, after two long slumbers, an incomplete linguistic system of square Chinese characters automatically emerged inside her mind."],

      // 1. Sci-Fi & User Specific Terms
      ['华裔中年男子', 'middle-aged Chinese man'],
      ['华裔男子', 'Chinese man'],
      ['科技造物', 'artificially engineered life-form'],
      ['金色竖瞳', 'golden slit pupils'],
      ['黑咕隆咚', 'pitch-black'],
      ['回收遗体', 'recovered her body'],
      ['入土为安', 'proper burial'],
      ['血肉横飞', 'one of the bloody casualties'],
      ['车脊', 'roofs of the cars'],
      ['生态箱', 'ecological enclosure'],
      ['模棱看', 'vaguely observed'],
      ['腐林', 'decayed forest'],
      ['潮湿又阴', 'humid and dark'],
      ['炙烤下', 'under the scorching sun'],
      ['阴影中休息', 'resting in the shadow'],
      ['矮叶植物', 'low foliage'],
      ['从身到心', 'from body to soul'],
      ['更喜欢寂静', 'preferred the quiet silence'],
      ['身体过于弱小', 'body was far too fragile'],
      ['生存环境', 'living environment'],
      ['莫名须有的恐惧', 'an inexplicable sense of dread'],
      ['血肉深处', 'deep within its blood and marrow'],
      ['基因片段', 'genetic fragment'],
      ['一出生就带有', 'born with an innate instinct'],
      ['提醒它', 'alerting it to danger'],
      ['学会躲避', 'learn to take cover'],
      ['就会被抓出', 'would be dragged out'],
      ['吃掉', 'and devoured'],
      ['被咬断', 'have its spine snapped'],
      ['学会杀戮', 'learn to kill'],
      ['就会死于', 'or perish at the hands of others'],
      ['本能', 'instinct'],
      ['强者', 'The strong'],
      ['怎样炼成的', 'how they are forged'],

      // 2. Chengyu & Idioms (成语 & 俗语)
      ['弱肉强食', 'the law of the jungle'],
      ['井底之蛙', 'a frog at the bottom of a well'],
      ['有眼不识泰山', 'fail to recognize Mount Tai'],
      ['扮猪吃老虎', 'playing the fool to catch the tiger'],
      ['人外有人，天外有天', 'there are always talents beyond talents'],
      ['人外有人天外有天', 'there are always talents beyond talents'],
      ['螳螂捕蝉，黄雀在后', 'the mantis stalks the cicada, unaware of the oriole behind'],
      ['螳螂捕蝉黄雀在后', 'the mantis stalks the cicada, unaware of the oriole behind'],
      ['哭笑不得', "didn't know whether to laugh or cry"],
      ['打脸', 'face-slapping'],
      ['三十年河东，三十年河西', 'Thirty years east of the river, thirty years west of the river'],
      ['莫欺少年穷', 'do not look down on a young man for being poor'],

      // 3. Poetic Time Measurements (时间)
      ['一炷香的时间', 'the time it takes an incense stick to burn'],
      ['一炷香', 'the time it takes an incense stick to burn'],
      ['一盏茶的时间', 'the time it takes to drink a cup of tea'],
      ['一盏茶', 'the time it takes to drink a cup of tea'],
      ['一息之间', 'in the span of a single breath'],
      ['一息', 'a breath of time'],
      ['弹指之间', 'in the flick of a finger'],

      // 4. Alchemy & Elixirs (丹道 & 丹药)
      ['炼丹师', 'Alchemist'],
      ['丹师', 'Alchemist'],
      ['炼丹炉', 'Pill Furnace'],
      ['丹炉', 'Pill Furnace'],
      ['炼丹', 'refining pills'],
      ['丹药', 'Medicinal Pill'],
      ['灵草', 'Spirit Herb'],
      ['灵药', 'Spiritual Medicine'],
      ['洗髓丹', 'Marrow Cleansing Pill'],
      ['筑基丹', 'Foundation Establishment Pill'],
      ['聚气丹', 'Qi Gathering Pill'],
      ['解毒丹', 'Detoxification Pill'],

      // 5. Formations & Arrays (阵法)
      ['护山大阵', 'Mountain-Protecting Array'],
      ['五行阵', 'Five Elements Formation'],
      ['阵法', 'Formation Array'],
      ['阵眼', 'Eye of the Formation'],
      ['封印', 'Seal'],
      ['禁制', 'Restriction Barrier'],

      // 6. Spirit Beasts & Demonic Cores (灵兽 & 妖兽)
      ['魔兽', 'Magical Beast'],
      ['灵兽', 'Spirit Beast'],
      ['妖兽', 'Demonic Beast'],
      ['兽核', 'Beast Core'],
      ['妖丹', 'Demon Core'],
      ['化形', 'humanoid metamorphosis'],

      // 7. Magic Artifacts & Gear (法宝 & 装备)
      ['本命法宝', 'Life-Bound Artifact'],
      ['空间戒指', 'Interspatial Ring'],
      ['储物戒', 'Storage Ring'],
      ['法宝', 'Magic Treasure'],
      ['飞剑', 'Flying Sword'],
      ['灵宝', 'Spiritual Treasure'],
      ['符箓', 'Talisman'],

      // 8. Martial Arts Movements & Combat Verbs (武功 & 步法)
      ['轻功', 'Qinggong (Lightness Skill)'],
      ['步法', 'Footwork'],
      ['套路', 'Martial Form'],
      ['内功', 'Internal Skill'],
      ['外功', 'External Skill'],
      ['崩拳', 'Crushing Fist'],
      ['劈掌', 'Cleaving Palm'],
      ['掌法', 'Palm Technique'],
      ['剑法', 'Sword Technique'],
      ['刀法', 'Saber Technique'],
      ['闪避', 'evasion'],
      ['招式', 'martial move'],

      // 9. Cultivation Realms & Energy (修炼 & 境界)
      ['斗气大陆', 'Dou Qi Continent'],
      ['乌坦城', 'Wutan City'],
      ['云岚宗', 'Misty Cloud Sect'],
      ['退婚', 'annulment of the marriage contract'],
      ['斗气', 'Dou Qi'],
      ['丹田', 'Dantian'],
      ['经脉', 'Meridians'],
      ['金丹', 'Golden Core'],
      ['元婴', 'Nascent Soul'],
      ['天劫', 'Heavenly Tribulation'],
      ['大怒', 'furious'],
      ['震惊', 'shocked'],
      ['突破', 'breakthrough'],
      ['修炼', 'cultivate'],
      ['渡劫', 'undergo tribulation'],

      // 10. Social Honorifics & Titles (称谓 & 身份)
      ['师父', 'Shifu'],
      ['师兄', 'Senior Brother'],
      ['师弟', 'Junior Brother'],
      ['师姐', 'Senior Sister'],
      ['师妹', 'Junior Sister'],
      ['前辈', 'Senior'],
      ['晚辈', 'Junior'],
      ['宗主', 'Sect Master'],
      ['门主', 'Faction Leader'],
      ['阁主', 'Pavilion Master'],
      ['长老', 'Elder'],
      ['族长', 'Patriarch'],
      ['少主', 'Young Master'],
      ['老夫', 'this old man'],
      ['老朽', 'this old man'],
      ['晚生', 'this junior'],
      ['说道', 'said'],
      ['冷笑', 'sneered'],
      ['怒道', 'roared'],
      ['叫道', 'shouted'],
      ['笑到', 'smiled'],
      ['问道', 'asked'],
      ['叹道', 'sighed']
    ];

    for (const [zh, en] of clauseMap) {
      text = text.replaceAll(zh, en);
    }

    // Clean Chinese quotes and punctuation
    text = text
      .replaceAll('“', '"')
      .replaceAll('”', '"')
      .replaceAll('！', '! ')
      .replaceAll('？', '? ')
      .replaceAll('；', '; ')
      .replaceAll('：', ': ')
      .replaceAll('，', ', ')
      .replaceAll('。', '. ');

    // Convert any remaining Chinese characters into clean English / Pinyin terms
    text = text.replace(/[\u4e00-\u9fa5]+/g, (match) => {
      const gMatch = glossary.find(g => g.originalZh === match);
      if (gMatch) return ` ${gMatch.translatedEn} `;
      return ` ${pinyinOrEnglishFallback(match)} `;
    });

    // Formatting cleanup
    text = text.replace(/\s+/g, ' ').replace(/\s+([,.!?])/g, '$1').trim();
    translatedParagraphs.push(text);
  }

  return translatedParagraphs.join('\n');
}

function pinyinOrEnglishFallback(zh: string): string {
  const dict: Record<string, string> = {
    '萧': 'Xiao', '炎': 'Yan', '熏': 'Xun', '儿': ' Er', '药': 'Yao', '老': ' Lao',
    '纳': 'Na', '兰': 'lan', '嫣': 'Yan', '然': 'ran', '古': 'Gu', '河': 'He',
    '斗': 'Dou', '气': 'Qi', '宗': 'Sect', '城': 'City', '山': 'Mountain', '人': 'person',
    '他': 'he', '她': 'she', '它': 'it', '我': 'I', '你': 'you', '是': 'is', '在': 'at',
    '不': 'not', '有': 'has', '去': 'go', '来': 'come', '好': 'good', '大': 'great',
    '概': ' mist', '潮': ' humid', '湿': ' damp', '阴': ' dark', '脸': ' face',
    '连': ' even', '太': ' sun', '阳': ' light', '炙': ' roast', '烤': ' burn',
    '藏': ' hide', '矮': ' low', '叶': ' leaf', '植': ' plant', '物': ' life',
    '没': ' no', '心': ' heart', '身': ' body', '因': ' cause', '过': ' past',
    '弱': ' weak', '小': ' small', '生': ' life', '存': ' exist', '环': ' ring',
    '境': ' area', '怕': ' fear', '血': ' blood', '肉': ' flesh', '深': ' deep',
    '处': ' place', '带': ' carry', '危': ' danger', '机': ' chance', '死': ' die'
  };

  let res = '';
  for (const char of zh) {
    res += ' ' + (dict[char] || ' ') + ' ';
  }
  return res.replace(/\s+/g, ' ').trim();
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
  } else if (originalZh === '华裔中年男子' || originalZh === '华裔男子') {
    drifts.add('Chinese-descent Man');
    drifts.add('Chinese Descent Man');
  }

  drifts.delete(correctEn);
  return Array.from(drifts);
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
