// 目的地数据源 —— 加城市 = 加一条记录 + 在 public/images/destinations/ 放同名图片
export const destinations = [
  {
    id: "beijing",
    name: "北京",
    slogan: "千年古都 · 紫禁之城",
    description:
      "故宫的红墙、长城的巍峨、胡同的烟火气——一座把历史装进日常的城市。",
    image: "/images/destinations/beijing.jpg",
    coord: "N 39°54′ · E 116°23′",
    tags: ["故宫", "长城", "胡同"],
  },
  {
    id: "shanghai",
    name: "上海",
    slogan: "东方明珠 · 魔都夜色",
    description:
      "外滩万国建筑群与陆家嘴天际线隔江相望，老弄堂与新地标交织出魔都的魔力。",
    image: "/images/destinations/shanghai-bund.jpg",
    coord: "N 31°14′ · E 121°28′",
    tags: ["外滩", "陆家嘴", "田子坊"],
  },
  {
    id: "chengdu",
    name: "成都",
    slogan: "天府之国 · 巴适慢生活",
    description:
      "火锅、熊猫、盖碗茶——这座城市把「巴适」过成了一种生活方式。",
    image: "/images/destinations/chengdu.jpg",
    coord: "N 30°40′ · E 104°04′",
    tags: ["熊猫基地", "宽窄巷子", "火锅"],
  },
  {
    id: "xian",
    name: "西安",
    slogan: "十三朝古都 · 长安梦回",
    description: "秦兵马俑的震撼、大唐不夜城的华灯、古城墙下的千年回响。",
    image: "/images/destinations/xian.jpg",
    coord: "N 34°20′ · E 108°56′",
    tags: ["兵马俑", "古城墙", "大唐不夜城"],
  },
  {
    id: "guilin",
    name: "桂林",
    slogan: "山水甲天下 · 漓江烟雨",
    description:
      "漓江竹筏、喀斯特峰林、阳朔田园——中国山水画走进现实的样子。",
    image: "/images/destinations/guilin.jpg",
    coord: "N 25°16′ · E 110°17′",
    tags: ["漓江", "阳朔", "遇龙河"],
  },
  {
    id: "sanya",
    name: "三亚",
    slogan: "椰风海韵 · 热带天堂",
    description:
      "细软的亚龙湾沙滩、清澈的海水、椰林摇曳——国内度假首选目的地。",
    image: "/images/destinations/sanya.jpg",
    coord: "N 18°15′ · E 109°30′",
    tags: ["亚龙湾", "蜈支洲岛", "免税店"],
  },
];

export function getDestinationByName(name) {
  if (!name) return null;
  return destinations.find(
    (d) => d.name === name || d.name.includes(name) || name.includes(d.name)
  );
}

export function getDestinationById(id) {
  return destinations.find((d) => d.id === id);
}
