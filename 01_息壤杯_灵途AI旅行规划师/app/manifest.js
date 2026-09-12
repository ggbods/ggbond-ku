export default function manifest() {
  return {
    name: "灵途 · AI 旅行规划师",
    short_name: "灵途",
    description: "生成、调整、保存并分享你的专属旅行攻略。",
    start_url: "/",
    display: "standalone",
    background_color: "#040A14",
    theme_color: "#040A14",
    lang: "zh-CN",
    categories: ["travel", "productivity"],
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon", purpose: "any" },
    ],
  };
}
