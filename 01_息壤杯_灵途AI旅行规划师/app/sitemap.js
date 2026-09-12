export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", "/plan", "/plan/recommend"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path ? "weekly" : "daily",
    priority: path ? 0.8 : 1,
  }));
}
