// Mock 攻略 —— 未配置 DEEPSEEK_API_KEY 时使用
// 基于一份精心编写的"成都 4 天"示例攻略，按用户输入做轻量适配：
// 标题换城市、天数截取/循环、预算按比例缩放。
// 前端会显示明显的"示例攻略"提示条，避免误导。

import { describeInterests } from "./interests";

const BASE_PLAN = {
  destination: "成都",
  title: "4天3晚成都慢享之旅",
  summary:
    "串联成都市区经典人文与美食体验，节奏适中，适合第一次来成都、喜欢美食与历史的朋友。",
  days: [
    {
      day: 1,
      title: "古都初探 · 宽窄慢生活",
      theme: "市区经典",
      items: [
        {
          period: "上午",
          spot: "宽窄巷子",
          activity: "逛清代古街，看川西民居，尝三大炮",
          duration: "2小时",
          transport: "地铁4号线宽窄巷子站",
          tips: "建议9点前到，人少好拍照",
        },
        {
          period: "下午",
          spot: "武侯祠",
          activity: "游览三国文化祠庙，看红墙竹影",
          duration: "2.5小时",
          transport: "打车约15分钟",
          tips: "门票50元，旁边就是锦里",
        },
        {
          period: "晚上",
          spot: "锦里",
          activity: "夜游锦里，吃小吃看夜景灯笼",
          duration: "2小时",
          transport: "从武侯祠步行可达",
          tips: "晚上灯亮起来氛围最佳",
        },
      ],
    },
    {
      day: 2,
      title: "熊猫之约 · 川味饕餮",
      theme: "萌宠与美食",
      items: [
        {
          period: "上午",
          spot: "成都大熊猫繁育研究基地",
          activity: "看大熊猫吃竹子、玩耍",
          duration: "3小时",
          transport: "地铁3号线熊猫大道站转摆渡车",
          tips: "务必提前在官方小程序预约门票",
        },
        {
          period: "下午",
          spot: "春熙路 / 太古里",
          activity: "逛商圈，看IFS熊猫爬楼，自由购物",
          duration: "3小时",
          transport: "地铁3号线春熙路站",
          tips: "网红打卡点之一",
        },
        {
          period: "晚上",
          spot: "九眼桥",
          activity: "河边漫步，小酒馆听民谣",
          duration: "2小时",
          transport: "打车约20分钟",
          tips: "感受成都夜生活",
        },
      ],
    },
    {
      day: 3,
      title: "古蜀文明 · 蜀道之韵",
      theme: "人文历史",
      items: [
        {
          period: "上午",
          spot: "金沙遗址博物馆",
          activity: "探秘古蜀金沙文明，看太阳神鸟金饰",
          duration: "2.5小时",
          transport: "地铁7号线金沙博物馆站",
          tips: "周一会闭馆，注意安排",
        },
        {
          period: "下午",
          spot: "杜甫草堂",
          activity: "感受诗圣故居的园林意境",
          duration: "2小时",
          transport: "打车约15分钟",
          tips: "门票50元",
        },
        {
          period: "晚上",
          spot: "东郊记忆",
          activity: "老厂房改造的文创园区，拍照出片",
          duration: "2小时",
          transport: "打车约20分钟",
          tips: "免费开放",
        },
      ],
    },
    {
      day: 4,
      title: "都江堰 · 拜水问道",
      theme: "周边山水",
      items: [
        {
          period: "上午",
          spot: "都江堰景区",
          activity: "看两千年的水利工程，叹古人智慧",
          duration: "3小时",
          transport: "地铁2号线终点站转公交/打车",
          tips: "可顺路看南桥夜景",
        },
        {
          period: "下午",
          spot: "青城山",
          activity: "登道教名山，感受清幽道观",
          duration: "3小时",
          transport: "从都江堰打车约30分钟",
          tips: "索道往返节省体力",
        },
        {
          period: "晚上",
          spot: "返程",
          activity: "返回市区，收拾行李",
          duration: "—",
          transport: "高铁/城际快线返回",
          tips: "预留1小时余量",
        },
      ],
    },
  ],
  food: [
    { name: "成都火锅", venue: "小龙坎(春熙路店)", avgPrice: 150, desc: "牛油锅底，必点毛肚、鸭肠" },
    { name: "担担面", venue: "街边老字号", avgPrice: 12, desc: "麻辣鲜香，最地道的川味早餐" },
    { name: "钵钵鸡", venue: "叶婆婆钵钵鸡", avgPrice: 60, desc: "冷锅串串，藤椒口味惊艳" },
    { name: "甜水面", venue: "洞子口张老二凉粉", avgPrice: 10, desc: "甜辣交融的特色小吃" },
    { name: "龙抄手", venue: "春熙路老店", avgPrice: 25, desc: "皮薄馅大，配红油汤底" },
  ],
  transport: {
    summary: "建议乘高铁/飞机抵达成都，市内以地铁和网约车为主，非常方便。",
    items: [
      "往返大交通：视出发地而定（高铁二等座约300-800元，飞机更快捷）",
      "市内交通：地铁网络覆盖主要景点，单程3-8元",
      "都江堰一日：地铁2号线 + 公交/打车",
    ],
  },
  budget: {
    total: 4000,
    currency: "CNY",
    breakdown: [
      { category: "交通", amount: 1200, note: "往返大交通 + 市内交通" },
      { category: "住宿", amount: 1200, note: "三晚经济型酒店（300元/晚）" },
      { category: "餐饮", amount: 800, note: "含火锅等特色餐" },
      { category: "门票", amount: 400, note: "熊猫基地、武侯祠、金沙等" },
      { category: "购物", amount: 400, note: "预留弹性" },
    ],
  },
  tips: [
    "熊猫基地门票务必提前在官方小程序预约",
    "地铁出行首选，高峰期打车会堵车",
    "川菜普遍偏辣，肠胃弱的朋友备好肠胃药",
    "9-10月天气最舒服，适合出行",
  ],
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const VARIANT_TITLES = ["经典平衡", "悠闲慢游", "紧凑打卡"];
const VARIANT_HINTS = [
  "",
  "（悠闲版：节奏放缓，主打深度体验）",
  "（紧凑版：高效打卡，一天多玩）",
];

export function buildMockPlan(input, variant = 0) {
  const plan = clone(BASE_PLAN);
  const destination = String(input.destination || "成都").trim() || "成都";
  const days = Math.max(1, Math.min(14, Number(input.days) || 4));
  const people = Math.max(1, Math.min(20, Number(input.people) || 1));
  const vTitle = VARIANT_TITLES[variant] || VARIANT_TITLES[0];

  // 1) 目的地与标题
  plan.destination = destination;
  plan.title = `${vTitle} · ${days}天${Math.max(0, days - 1)}晚${destination}之旅`;

  // 2) 天数适配：截取或循环补充
  const baseDays = plan.days;
  plan.days = [];
  for (let i = 0; i < days; i++) {
    const src = baseDays[i % baseDays.length];
    plan.days.push({ ...clone(src), day: i + 1 });
  }

  // 3) 预算适配：按比例缩放（取整到50元），并让明细加总等于 total
  const targetBudget = Number(input.budget) || 0;
  if (targetBudget > 0) {
    const ratio = targetBudget / BASE_PLAN.budget.total;
    plan.budget.breakdown = BASE_PLAN.budget.breakdown.map((b) => ({
      ...b,
      amount: Math.max(0, Math.round((b.amount * ratio) / 50) * 50),
      note: `${b.note}（${people} 人合计）`,
    }));
    plan.budget.total = plan.budget.breakdown.reduce((s, b) => s + b.amount, 0);
  }

  // 4) 个性化：带上用户偏好、人数与方案风格
  const interests = describeInterests(input.interests);
  const tags = [`${people} 人出行`, input.pace, input.with, input.foodPreference]
    .filter(Boolean)
    .join("、");
  const hint = VARIANT_HINTS[variant] || "";
  plan.summary = `${plan.summary}（示例已按你的偏好调整：${tags || "默认"}${
    interests === "未指定" ? "" : `；兴趣权重 ${interests}`
  }${hint}）`;

  return plan;
}

/* ================= 推荐目的地 mock ================= */

const RECOMMEND_FALLBACK = {
  海边度假: ["三亚", "厦门", "青岛"],
  山水自然: ["桂林", "九寨沟", "张家界"],
  历史古城: ["西安", "北京", "南京"],
  都市时尚: ["上海", "成都", "深圳"],
  美食之旅: ["成都", "广州", "长沙"],
  亲子乐园: ["上海", "珠海", "北京"],
  全面体验: ["成都", "北京", "杭州"],
};

const RECOMMEND_TAGLINE = {
  三亚: "椰风海韵，热带天堂",
  厦门: "文艺海岛，慢生活",
  青岛: "红瓦绿树，碧海蓝天",
  桂林: "山水甲天下",
  九寨沟: "人间仙境，五彩池海",
  张家界: "奇峰林立，阿凡达取景地",
  西安: "十三朝古都，梦回长安",
  北京: "千年古都，紫禁之城",
  南京: "六朝古都，金陵烟雨",
  上海: "东方明珠，魔都夜色",
  成都: "天府之国，巴适生活",
  深圳: "创新之都，滨海之城",
  广州: "食在广州，烟火人间",
  长沙: "娱乐之都，美食天堂",
  珠海: "浪漫之城，海岛乐园",
  杭州: "人间天堂，西湖烟雨",
};

export function buildMockRecommend(input) {
  const type = String(input.travelType || "全面体验").trim();
  const names = RECOMMEND_FALLBACK[type] || RECOMMEND_FALLBACK["全面体验"];
  return names.slice(0, 3).map((name) => ({
    name,
    tagline: RECOMMEND_TAGLINE[name] || "值得一去的旅行地",
    why: `贴合你「${type}」的需求，是同类目的地里体验和口碑都很出色的选择。`,
    bestFor: "各类旅行者",
    bestSeason: "四季皆宜",
  }));
}
