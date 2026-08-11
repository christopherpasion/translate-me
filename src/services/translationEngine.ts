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

  for (const chapter of chapters) {
    if (!chapter.contentEn) continue;

    const regex = new RegExp(`\\b${escapeRegExp(oldEn)}\\b`, 'gi');
    if (regex.test(chapter.contentEn)) {
      chapter.contentEn = chapter.contentEn.replace(regex, newEn);
      chapter.selfHealedCount = (chapter.selfHealedCount || 0) + 1;
      chapter.updatedAt = new Date().toISOString();
      StorageService.saveChapter(chapter);
      updatedChaptersCount++;

      // Log self healing record
      StorageService.addHealingRecord({
        id: 'cascade-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        chapterId: chapter.id,
        originalDraftText: oldEn,
        autoHealedText: newEn,
        termZh,
        incorrectEn: oldEn,
        correctedEn: newEn,
        timestamp: new Date().toISOString()
      });
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

    // Common narrative clauses & speech tags
    const clauseMap: [string, string][] = [
      ['退婚', 'annulment of the marriage contract'],
      ['斗气大陆', 'Dou Qi Continent'],
      ['乌坦城', 'Wutan City'],
      ['云岚宗', 'Misty Cloud Sect'],
      ['大怒', 'furious'],
      ['震惊', 'shocked'],
      ['突破', 'breakthrough'],
      ['修炼', 'cultivate'],
      ['长老', 'Elder'],
      ['族长', 'Patriarch'],
      ['少主', 'Young Master'],
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

    // Convert any remaining Chinese characters to readable English romanization / text
    text = text.replace(/[\u4e00-\u9fa5]+/g, (match) => {
      const gMatch = glossary.find(g => g.originalZh === match);
      if (gMatch) return gMatch.translatedEn;
      return pinyinOrEnglishFallback(match);
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
    '不': 'not', '有': 'has', '去': 'go', '来': 'come', '好': 'good', '大': 'great'
  };

  let res = '';
  for (const char of zh) {
    res += (dict[char] || char) + ' ';
  }
  return res.trim();
}

function getPossibleDrifts(originalZh: string, correctEn: string): string[] {
  const drifts: string[] = [];
  
  if (originalZh === '萧炎') {
    drifts.push('Little Flame', 'Xiao Flame', 'Fire Xiao');
  } else if (originalZh === '云岚宗') {
    drifts.push('Cloud Mist Sect', 'Mist Cloud Sect', 'Yunlan Sect');
  } else if (originalZh === '药老') {
    drifts.push('Medicine Old', 'Old Medicine', 'Elder Yao');
  } else if (originalZh === '纳兰嫣然') {
    drifts.push('Nalan Yan Ran', 'Graceful Nalan');
  }

  // Generic drift heuristics
  if (correctEn.includes(' ')) {
    const parts = correctEn.split(' ');
    if (parts.length === 2) {
      drifts.push(`${parts[0]} ${parts[1]} (drift)`);
    }
  }

  return drifts;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
