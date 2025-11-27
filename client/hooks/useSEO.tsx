import { useEffect, useCallback } from 'react';

interface MetaImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | MetaImage;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterSite?: string;
  twitterCreator?: string;
  canonical?: string;
  structuredData?: object | object[];
  noindex?: boolean;
  nofollow?: boolean;
  language?: string;
  favicon?: string;
  themeColor?: string;
  author?: string;
  viewport?: string;
  alternateUrls?: { [key: string]: string };
}

export const useSEO = ({
  title = 'Nolads Engineering - Power Your Future',
  description = 'Leading electrical engineering services for Generator Installations, Industrial applications,  Power systems design and installations and performance monitoring.',
  keywords = 'electrical engineering, power systems, industrial automation, safety solutions, electrical design, power distribution, SCADA, PLC programming',
  ogTitle,
  ogDescription,
  ogImage = {
    url: '/logo/logo1.png',
    width: 1200,
    height: 630,
    alt: 'Nolads Engineering'
  },
  ogUrl,
  twitterCard = 'summary_large_image',
  twitterSite = '@NoladsEng',
  twitterCreator,
  canonical,
  structuredData,
  noindex = false,
  nofollow = false,
  language = 'en',
  favicon = '/favicon.ico',
  themeColor = '#000000',
  author = 'Nolads Engineering',
  viewport = 'width=device-width, initial-scale=1.0',
  alternateUrls = {}
}: SEOProps = {}) => {
  const updateMetaTag = useCallback((name: string, content: string, property?: boolean) => {
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      if (property) {
        element.setAttribute('property', name);
      } else {
        element.setAttribute('name', name);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  }, []);

  const updateLinkTag = useCallback((rel: string, href: string, hreflang?: string) => {
    const selector = hreflang 
      ? `link[rel="${rel}"][hreflang="${hreflang}"]`
      : `link[rel="${rel}"]`;
    let element = document.querySelector(selector) as HTMLLinkElement;
    
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      if (hreflang) {
        element.setAttribute('hreflang', hreflang);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('href', href);
  }, []);

  useEffect(() => {
    // Set page title
    document.title = title;

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    updateMetaTag('viewport', viewport);

    // Robots meta tag
    const robotsContent = [];
    if (noindex) robotsContent.push('noindex');
    if (nofollow) robotsContent.push('nofollow');
    if (robotsContent.length > 0) {
      updateMetaTag('robots', robotsContent.join(','));
    }

    // Language
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('lang', language);

    // Theme color
    updateMetaTag('theme-color', themeColor);

    // Favicon
    updateLinkTag('icon', favicon);
    updateLinkTag('shortcut icon', favicon);

    // Open Graph tags
    updateMetaTag('og:title', ogTitle || title, true);
    updateMetaTag('og:description', ogDescription || description, true);
    updateMetaTag('og:type', 'website', true);
    
    // Handle OG Image
    if (typeof ogImage === 'string') {
      updateMetaTag('og:image', ogImage, true);
    } else {
      updateMetaTag('og:image', ogImage.url, true);
      if (ogImage.width) updateMetaTag('og:image:width', String(ogImage.width), true);
      if (ogImage.height) updateMetaTag('og:image:height', String(ogImage.height), true);
      if (ogImage.alt) updateMetaTag('og:image:alt', ogImage.alt, true);
      if (ogImage.type) updateMetaTag('og:image:type', ogImage.type, true);
    }
    
    if (ogUrl) {
      updateMetaTag('og:url', ogUrl, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', typeof ogImage === 'string' ? ogImage : ogImage.url);
    if (twitterSite) updateMetaTag('twitter:site', twitterSite);
    if (twitterCreator) updateMetaTag('twitter:creator', twitterCreator);

    // Canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Alternate language URLs
    Object.entries(alternateUrls).forEach(([lang, url]) => {
      updateLinkTag('alternate', url, lang);
    });

    // Structured Data
    const structuredDataArray = Array.isArray(structuredData) 
      ? structuredData 
      : structuredData ? [structuredData] : [];

    if (structuredDataArray.length > 0) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      
      scriptElement.textContent = JSON.stringify(structuredDataArray);
    }

    // Cleanup function
    return () => {
      document.title = 'Nolads Engineering - Power Your Future';
    };
  }, [
    title, description, keywords, ogTitle, ogDescription, ogImage, ogUrl,
    twitterCard, twitterSite, twitterCreator, canonical, structuredData,
    noindex, nofollow, language, favicon, themeColor, author, viewport,
    alternateUrls, updateMetaTag, updateLinkTag
  ]);
};

export default useSEO;