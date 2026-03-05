import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BASE_URL = "https://www.noladseng.com";

// Static pages
const staticPages = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/services", priority: "0.9", changefreq: "monthly" },
  { loc: "/products", priority: "0.8", changefreq: "weekly" },
  { loc: "/about", priority: "0.7", changefreq: "monthly" },
  { loc: "/contact", priority: "0.7", changefreq: "monthly" },
  { loc: "/blog", priority: "0.8", changefreq: "weekly" },
  { loc: "/login", priority: "0.3", changefreq: "yearly" },
];

// Kenya cities for location pages
const kenyaCities = [
  "nairobi", "mombasa", "kisumu", "eldoret", "nakuru", 
  "thika", "malindi", "kitale", "garissa", "nyeri",
  "meru", "machakos", "lamu", "nakuru", "naivasha"
];

// Generate XML sitemap
router.get("/sitemap.xml", async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let dynamicUrls = [...staticPages];
    
    // Add city-specific service pages
    kenyaCities.forEach(city => {
      dynamicUrls.push({
        loc: `/services/city/${city}`,
        priority: "0.8",
        changefreq: "monthly"
      });
    });
    
    // Fetch services from database
    if (supabase) {
      try {
        const { data: services } = await supabase
          .from("services")
          .select("id, slug, updated_at")
          .eq("is_active", true);
        
        if (services) {
          services.forEach((service: any) => {
            dynamicUrls.push({
              loc: `/services/${service.slug || service.id}`,
              priority: "0.8",
              changefreq: "monthly"
            });
          });
        }
      } catch (err) {
        console.log("[SEO] Could not fetch services:", err);
      }
      
      // Fetch blog posts
      try {
        const { data: posts } = await supabase
          .from("blog_posts")
          .select("slug, updated_at, published_at")
          .eq("status", "published");
        
        if (posts) {
          posts.forEach((post: any) => {
            dynamicUrls.push({
              loc: `/blog/${post.slug}`,
              priority: "0.7",
              changefreq: "weekly"
            });
          });
        }
      } catch (err) {
        console.log("[SEO] Could not fetch blog posts:", err);
      }
    }
    
    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
    
    dynamicUrls.forEach(page => {
      xml += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });
    
    xml += `</urlset>`;
    
    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("[SEO] Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Generate robots.txt
router.get("/robots.txt", (req, res) => {
  const robots = `# Robots.txt for Nolads Engineering
# https://www.noladseng.com

# Main search engine bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /

# Social media bots
User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# All other bots
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /login

# Sitemap location
Sitemap: ${BASE_URL}/api/seo/sitemap.xml

Host: ${BASE_URL}
`;
  
  res.set("Content-Type", "text/plain");
  res.send(robots);
});

export default router;
