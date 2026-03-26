import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://english-learning-app-beta-ten.vercel.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://english-learning-app-beta-ten.vercel.app/lessons", lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: "https://english-learning-app-beta-ten.vercel.app/speaking", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://english-learning-app-beta-ten.vercel.app/vocabulary", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://english-learning-app-beta-ten.vercel.app/grammar", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://english-learning-app-beta-ten.vercel.app/roadmap", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://english-learning-app-beta-ten.vercel.app/simulation", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://english-learning-app-beta-ten.vercel.app/dashboard", lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: "https://english-learning-app-beta-ten.vercel.app/signup", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 }
  ];
}