import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils/features";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/confirmation", "/purchase"] }], sitemap: `${siteUrl()}/sitemap.xml` };
}
