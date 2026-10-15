import { useEffect } from 'react';
import { pageMetadata, safeJson } from '../lib/seo.mjs';

export default function PageMetadata({ config, candidate, notFound = false }) {
  useEffect(() => {
    const metadata = pageMetadata(config, candidate, notFound);
    document.title = metadata.title;
    const setMeta = (key, value, property = false) => {
      const attribute = property ? 'property' : 'name';
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, key); document.head.append(element); }
      element.content = value;
    };
    setMeta('description', metadata.description); setMeta('robots', metadata.robots);
    for (const [key, value] of Object.entries({ title: metadata.title, description: metadata.description, url: metadata.canonical, image: metadata.image })) setMeta(`og:${key}`, value, true);
    for (const [key, value] of Object.entries({ title: metadata.title, description: metadata.description, image: metadata.image })) setMeta(`twitter:${key}`, value);
    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = metadata.canonical;
    let schema = document.getElementById('campaign-structured-data');
    if (metadata.structuredData) {
      if (!schema) { schema = document.createElement('script'); schema.id = 'campaign-structured-data'; schema.type = 'application/ld+json'; document.head.append(schema); }
      schema.textContent = safeJson(metadata.structuredData);
    } else schema?.remove();
  }, [config, candidate, notFound]);
  return null;
}
