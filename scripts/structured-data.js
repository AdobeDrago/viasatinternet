/*
 * Shared JSON-LD helpers for AI visibility / rich results.
 * Blocks register their items; each call (re)writes one merged script element per type,
 * so content decorated inside fragments (before they are attached) is still included.
 */

const BLOCK_ELEMENTS = 'p, li, h1, h2, h3, h4, h5, h6, div, br, tr, td, th, dt, dd, blockquote';
const faqEntries = new Map();
const productEntries = new Map();

/**
 * Collapses whitespace in an element's (or string's) text content.
 * @param {Element|string} source
 * @returns {string}
 */
export function plainText(source) {
  let text = '';
  if (typeof source === 'string') {
    text = source;
  } else if (source) {
    // keep a space between block-level elements ("U.S." + "<li>Rural" -> "U.S. Rural")
    const clone = source.cloneNode(true);
    clone.querySelectorAll?.(BLOCK_ELEMENTS).forEach((el) => el.after(' '));
    text = clone.textContent || '';
  }
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Creates or replaces a JSON-LD script element in the document head.
 * @param {string} id Script element id
 * @param {object} data JSON-LD object
 * @returns {HTMLScriptElement}
 */
export function upsertJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.append(script);
  }
  script.textContent = JSON.stringify(data);
  return script;
}

/**
 * Adds Q&As and (re)builds the single merged FAQPage JSON-LD (`#faq-jsonld`).
 * Duplicate questions (same text) are emitted once.
 * @param {{question: string, answer: string}[]} items
 */
export function upsertFaqJsonLd(items = []) {
  items.forEach(({ question, answer }) => {
    const name = plainText(question);
    const text = plainText(answer);
    if (name && text && !faqEntries.has(name)) faqEntries.set(name, text);
  });
  if (!faqEntries.size) return;
  upsertJsonLd('faq-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...faqEntries].map(([name, text]) => ({
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text },
    })),
  });
}

/**
 * Adds products and (re)builds the merged Product/Offer JSON-LD (`#product-jsonld`).
 * @param {{name: string, description?: string, price: string,
 *   priceCurrency?: string, url?: string}[]} items
 */
export function upsertProductJsonLd(items = []) {
  items.forEach((item) => {
    const name = plainText(item.name);
    if (!name || !item.price) return;
    const offer = {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: item.priceCurrency || 'USD',
    };
    if (item.url) offer.url = item.url;
    const product = { '@type': 'Product', name, offers: offer };
    if (item.description) product.description = plainText(item.description);
    productEntries.set(name, product);
  });
  if (!productEntries.size) return;
  upsertJsonLd('product-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [...productEntries.values()],
  });
}
