// 提示词模板 —— 把用户需求翻译成 DeepSeek 的生成指令
// 注意：系统提示词里必须出现 "json" 字样（DeepSeek JSON mode 的硬性要求，否则返回 400）

import { describeInterests } from "./interests";

export const SYSTEM_PROMPT = `你是一位资深的中文旅行规划师，为中文用户生成详细、实用、可执行的旅行攻略。

【硬性要求】
- 只输出一个合法的 JSON 对象，不要输出 JSON 以外的任何文字、解释或前后缀。
- 字段名与给出的结构示例完全一致，不要增减。
- 景点、美食名称使用中文；金额为人民币整数（单位：元）。
- 每天按"上午/下午/晚上"三个时间段安排，每段 1~2 个活动，考虑通勤和用餐时间，安排要合理。
- 交通建议要具体（高铁/地铁/打车及大致用时）。
- 总预算是全部同行人的合计金额：住宿按人数拆分房间数，餐饮/门票/交通按人数计算，预算明细各项加总要接近总预算。
- 行程强度、餐厅选择、住宿房型要匹配出行人数（例如 4 人以上优先考虑包车、家庭房、可分享的餐厅）。
- 「感兴趣的」是有序列表，序号 1 权重最高：排在前面的兴趣要占更多时间与更好的时段，靠后的作为补充。
- 根据用户的偏好（节奏、同游人群、人数、口味、兴趣权重）进行个性化，并在 summary 和 tips 中体现。
- 天数少时宁精勿滥，不要硬塞景点。`;

export const JSON_EXAMPLE = `输出结构示例（json）：
{
  "destination": "成都",
  "title": "4天3晚成都慢享之旅",
  "summary": "一句话概括本次行程的特色与适配人群",
  "days": [
    {
      "day": 1,
      "title": "古都初探 · 宽窄慢生活",
      "theme": "市区经典",
      "items": [
        {
          "period": "上午",
          "spot": "宽窄巷子",
          "activity": "逛清代古街，看川西民居，尝三大炮",
          "duration": "2小时",
          "transport": "地铁4号线宽窄巷子站",
          "tips": "建议上午9点前到，人少好拍照"
        },
        { "period": "下午", "spot": "武侯祠", "activity": "游览三国文化祠庙", "duration": "2.5小时", "transport": "打车约15分钟", "tips": "门票50元" },
        { "period": "晚上", "spot": "锦里", "activity": "夜游锦里，吃小吃看夜景", "duration": "2小时", "transport": "步行可达", "tips": "灯笼亮起来很好看" }
      ]
    }
  ],
  "food": [
    { "name": "成都火锅", "venue": "小龙坎(春熙路店)", "avgPrice": 150, "desc": "牛油锅底，必点毛肚、鸭肠" }
  ],
  "transport": {
    "summary": "往返大交通 + 市内交通说明",
    "items": ["上海→成都 高铁约11小时 二等座约600元", "市内以地铁和网约车为主"]
  },
  "budget": {
    "total": 4000,
    "currency": "CNY",
    "breakdown": [
      { "category": "交通", "amount": 1200, "note": "往返高铁 + 市内交通" },
      { "category": "住宿", "amount": 1200, "note": "三晚经济型酒店" },
      { "category": "餐饮", "amount": 800, "note": "含火锅等特色餐" },
      { "category": "门票", "amount": 400, "note": "武侯祠、熊猫基地等" },
      { "category": "购物", "amount": 400, "note": "预留弹性" }
    ]
  },
  "tips": ["提前3天预约熊猫基地门票", "10月气温适中适合出游"]
}`;

export function buildUserMessage(input) {
  const people = Number(input.people) > 0 ? Number(input.people) : 1;
  const perPersonDay =
    input.budget && input.days ? Math.round(input.budget / people / input.days) : null;
  const lines = [
    "请为以下用户生成旅行攻略：",
    `- 目的地：${input.destination}`,
    `- 出行天数：${input.days} 天`,
    `- 出行人数：${people} 人`,
    `- 总预算：${input.budget} 元（${people} 人合计${
      perPersonDay ? `，人均每天约 ${perPersonDay} 元` : ""
    }）`,
    `- 出发城市：${input.departureCity || "未指定"}`,
    `- 旅行节奏：${input.pace || "适中"}`,
    `- 同游人群：${input.with || "未指定"}`,
    `- 美食口味：${input.foodPreference || "未指定"}`,
    `- 感兴趣的（按权重排序，1 最重要）：${describeInterests(input.interests)}`,
    `- 长期偏好画像：${input.profileTags?.join("、") || "未指定"}`,
  ];
  if (input.extra) lines.push(`- 其他要求：${input.extra}`);
  return lines.join("\n");
}

// 多方案生成：style 为本次方案的风格提示
export function buildMessages(input, style) {
  let user = buildUserMessage(input);
  if (style) user += `\n\n【本次方案风格】${style}。请围绕这一风格组织行程与文案。`;
  return [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n${JSON_EXAMPLE}` },
    { role: "user", content: user },
  ];
}

/* ================= 目的地推荐 ================= */

export const RECOMMEND_SYSTEM_PROMPT = `你是一位资深的中文旅行顾问，为中文用户推荐最适合他的旅行目的地。

【硬性要求】
- 只输出一个合法的 JSON 对象（json 格式），不要输出其他任何文字。
- 目的地必须是真实存在、适合旅游的城市或地区，优先推荐国内热门目的地。
- 每个推荐必须贴合用户的需求，理由要具体、有说服力。
- 预算是全部同行人的合计金额，请结合出行人数判断目的地的性价比（人均预算偏低时避开机票/住宿昂贵的地方）。
- 「感兴趣的」是有序列表，序号 1 权重最高：推荐理由要优先回应排在前面的兴趣。
- 输出结构示例（json）：
{
  "recommendations": [
    {
      "name": "三亚",
      "tagline": "椰风海韵，热带天堂",
      "why": "贴合用户海边度假 + 预算适中的需求，亚龙湾沙滩细腻，适合放松休闲",
      "bestFor": "情侣 / 家庭度假，喜欢大海与阳光的人",
      "bestSeason": "10月 - 次年4月"
    }
  ]
}`;

export function buildRecommendUserMessage(input) {
  const people = Number(input.people) > 0 ? Number(input.people) : 1;
  const lines = [
    "请为以下用户推荐 3 个旅行目的地：",
    `- 想去的地方类型：${input.travelType || "全面体验"}`,
    `- 出行天数：${input.days} 天`,
    `- 出行人数：${people} 人`,
    `- 总预算：${input.budget} 元（${people} 人合计）`,
    `- 同游人群：${input.with || "未指定"}`,
    `- 感兴趣的（按权重排序，1 最重要）：${describeInterests(input.preferences)}`,
  ];
  if (input.extra) lines.push(`- 其他要求：${input.extra}`);
  return lines.join("\n");
}

export function buildRecommendMessages(input) {
  return [
    { role: "system", content: RECOMMEND_SYSTEM_PROMPT },
    { role: "user", content: buildRecommendUserMessage(input) },
  ];
}

export function buildRefineMessages({ plan, instruction, history = [] }) {
  const conversation = history
    .slice(-6)
    .map((item) => `${item.role === "user" ? "用户" : "灵途"}：${item.content}`)
    .join("\n");
  return [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}

你正在修改一份已经生成的旅行攻略。只根据用户最新要求调整相关日期、活动或预算；没有被提及的字段必须原样保留。仍然只输出完整合法的 JSON 对象，字段结构必须与原攻略一致。`,
    },
    {
      role: "user",
      content: `原攻略（json）：\n${JSON.stringify(plan)}\n\n历史对话：\n${conversation || "无"}\n\n最新修改要求：${instruction}`,
    },
  ];
}
