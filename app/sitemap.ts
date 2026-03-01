import cityProceduresData from "@/lib/data/city-procedures.json";
import clinicsData from "@/lib/data/clinics.json";
import treatmentsData from "@/lib/data/treatments.json";
import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kmedtour.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const clinics = clinicsData as { slug: string }[];
  const treatments = treatmentsData as { slug: string }[];
  const cityProcedures = cityProceduresData as {
    citySlug: string;
    procedureSlug: string;
  }[];

  // Use a stable "today" date for static entries (avoids thrashing the sitemap on every request)
  const today = new Date().toISOString().split("T")[0];

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1.0,
      lastModified: today,
    },
    {
      url: `${siteUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: today,
    },
    {
      url: `${siteUrl}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.7,
      lastModified: today,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
      lastModified: today,
    },
    {
      url: `${siteUrl}/procedures`,
      changeFrequency: "weekly",
      priority: 0.9,
      lastModified: today,
    },
    {
      url: `${siteUrl}/hospitals`,
      changeFrequency: "weekly",
      priority: 0.9,
      lastModified: today,
    },
    {
      url: `${siteUrl}/treatment-advisor`,
      changeFrequency: "monthly",
      priority: 0.8,
      lastModified: today,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
      lastModified: today,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
      lastModified: today,
    },
  ];

  // Hospital pages
  const hospitalEntries: MetadataRoute.Sitemap = clinics.map((clinic) => ({
    url: `${siteUrl}/hospitals/${clinic.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: today,
  }));

  // Procedure pages
  const procedureEntries: MetadataRoute.Sitemap = treatments.map((proc) => ({
    url: `${siteUrl}/procedures/${proc.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: today,
  }));

  // City + Procedure pSEO pages
  const cityProcedureEntries: MetadataRoute.Sitemap = cityProcedures.map(
    (cp) => ({
      url: `${siteUrl}/${cp.citySlug}/${cp.procedureSlug}`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: today,
    }),
  );

  return [
    ...staticPages,
    ...hospitalEntries,
    ...procedureEntries,
    ...cityProcedureEntries,
  ];
}
