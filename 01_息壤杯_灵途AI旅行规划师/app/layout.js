import "@fortawesome/fontawesome-free/css/all.min.css";
import "./fonts.css";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AppProvider from "@/components/providers/AppProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import CelestialBackground from "@/components/layout/CelestialBackground";

export const metadata = {
  title: {
    default: "灵途 · AI 旅行规划师 | 一键生成专属旅行攻略",
    template: "%s | 灵途 · AI 旅行规划师",
  },
  description:
    "输入预算、天数和偏好，AI 自动为你生成完整的旅行攻略——每日行程、景点、美食、交通、预算一站式规划。",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "灵途",
  keywords: ["AI旅行规划", "旅行攻略", "行程规划", "灵途"],
  openGraph: {
    title: "灵途 · AI 旅行规划师",
    description: "把想去的地方，变成一份真正能出发的攻略。",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4ECDB" },
    { media: "(prefers-color-scheme: dark)", color: "#07111F" },
  ],
};

// 首屏前先定主题，避免深色用户看到一瞬间的纸白（与 AppProvider 读同一份存储）
const THEME_BOOTSTRAP = `(function(){try{
var s=JSON.parse(localStorage.getItem('lingtu_theme_v1')||'null');
var m=s&&s.mode?s.mode:'system';
var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.dataset.theme=dark?'dark':'light';
if(s&&s.accent)document.documentElement.dataset.accent=s.accent;
}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <CelestialBackground />
        <AuthProvider>
          <AppProvider>
            <a className="skip-link" href="#main-content">跳到主要内容</a>
            <Navbar />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
