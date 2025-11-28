import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  noIndex?: boolean;
  keywords?: string;
  canonical?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterCreator?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  type?: 'website' | 'article' | 'product' | 'blog';
}

export function useSEO({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  noIndex,
  keywords,
  canonical,
  twitterCard,
  twitterCreator,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  type
}: SEOProps = {}) {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = `${title} | Nolads Engineering`;
    }

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', ogTitle || title);
    updateMetaTag('og:description', ogDescription || description);
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:url', ogUrl);
    updateMetaTag('og:type', type || 'website');
    
    // Twitter Card
    updateMetaTag('twitter:card', twitterCard || 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);
    if (twitterCreator) {
      updateMetaTag('twitter:creator', twitterCreator);
    }

    // Article metadata
    if (type === 'article') {
      updateMetaTag('article:published_time', articlePublishedTime);
      updateMetaTag('article:modified_time', articleModifiedTime);
      updateMetaTag('article:author', articleAuthor);
    }

    // Canonical URL
    let link = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    } else if (link) {
      link.remove();
    }

    // Handle robots meta tag
    if (noIndex) {
      updateMetaTag('robots', 'noindex,nofollow');
    } else {
      removeMetaTag('robots');
    }

    // Cleanup
    return () => {
      removeMetaTag('description');
      removeMetaTag('og:title');
      removeMetaTag('og:description');
      removeMetaTag('og:image');
      removeMetaTag('og:url');
      removeMetaTag('robots');
      removeMetaTag('keywords');
      removeMetaTag('twitter:card');
      removeMetaTag('twitter:creator');
      removeMetaTag('article:published_time');
      removeMetaTag('article:modified_time');
      removeMetaTag('article:author');
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) canonicalLink.remove();
    };
  }, [
    title,
    description,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    noIndex,
    keywords,
    canonical,
    twitterCard,
    twitterCreator,
    articlePublishedTime,
    articleModifiedTime,
    articleAuthor,
    type
  ]);
}

function updateMetaTag(name: string, content?: string) {
  if (!content) {
    removeMetaTag(name);
    return;
  }

  let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
}

function removeMetaTag(name: string) {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  if (meta) {
    meta.remove();
  }
}
