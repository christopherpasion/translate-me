/**
 * Simplified (简体) <-> Traditional (繁體) Chinese Script Converter
 */

const SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '萧炎': '蕭炎',
  '斗破苍穹': '鬥破蒼穹',
  '诡秘之主': '詭秘之主',
  '一念永恒': '一念永恆',
  '云岚宗': '雲嵐宗',
  '纳兰嫣然': '納蘭嫣然',
  '药老': '藥老',
  '乌坦城': '烏坦城',
  '焰分噬浪尺': '焰分噬浪尺',
  '斗气': '鬥氣',
  '练气': '練氣',
  '金丹': '金丹',
  '元婴': '元嬰',
  '化神': '化神',
  '渡劫': '渡劫',
  '宗门': '宗門',
  '神识': '神識',
  '国': '國',
  '门': '門',
  '书': '書',
  '发': '發',
  '爱': '愛',
  '观': '觀',
  '见': '見',
  '听': '聽',
  '体': '體',
  '关': '關',
  '时': '時',
  '间': '間',
  '会': '會',
  '极': '極',
  '华': '華',
  '龙': '龍',
  '凤': '鳳',
  '灵': '靈',
  '阴': '陰',
  '阳': '陽',
  '剑': '劍',
  '经': '經',
  '典': '典',
  '术': '術',
  '绝': '絕',
  '变': '變',
  '强': '強'
};

const TRADITIONAL_TO_SIMPLIFIED: Record<string, string> = Object.entries(SIMPLIFIED_TO_TRADITIONAL).reduce(
  (acc, [simp, trad]) => {
    acc[trad] = simp;
    return acc;
  },
  {} as Record<string, string>
);

export function convertToTraditional(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [simp, trad] of Object.entries(SIMPLIFIED_TO_TRADITIONAL)) {
    result = result.split(simp).join(trad);
  }
  return result;
}

export function convertToSimplified(text: string): string {
  if (!text) return '';
  let result = text;
  for (const [trad, simp] of Object.entries(TRADITIONAL_TO_SIMPLIFIED)) {
    result = result.split(trad).join(simp);
  }
  return result;
}
