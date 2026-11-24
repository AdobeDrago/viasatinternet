/*
 * Accordion (FAQ)
 * Extends the accordion block (details/summary) for FAQs:
 * - one row per Q&A: [question (plain text) | answer (rich text)]
 * - every item gets a stable id = slug of the question, `#<slug>` opens it
 * - reference rows (one cell holding only a link to /fragments/faq/<topic>#<slug>) are
 *   replaced by that single Q&A from the topic fragment
 * - all decorated Q&As on the page feed one merged FAQPage JSON-LD (#faq-jsonld)
 * - single-expand: opening an item closes the others in the same block
 */

import { decorateIcons } from '../../scripts/aem.js';
import { plainText, upsertFaqJsonLd } from '../../scripts/structured-data.js';
import fetchPlain from '../../scripts/fetch-plain.js';

const FAQ_FRAGMENT_PATH = /\/fragments\/faq\//;
const fragmentCache = new Map();
const usedIds = new Set();

/**
 * Slug of a question, used as the item id and the reference-row hash.
 * "How does satellite internet work?" -> "how-does-satellite-internet-work"
 * @param {string} text Question text
 * @returns {string}
 */
export function questionSlug(text) {
  return plainText(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^0-9a-z]+/g, '-')
    .replace(/^-|-$/g, '');
}

function uniqueId(slug) {
  let id = slug || 'faq';
  let n = 1;
  while (usedIds.has(id) || document.getElementById(id)) {
    n += 1;
    id = `${slug}-${n}`;
  }
  usedIds.add(id);
  return id;
}

/**
 * Returns the reference link of a reference row, or null.
 * @param {Element} row
 * @returns {HTMLAnchorElement|null}
 */
function getReferenceLink(row) {
  if (row.children.length !== 1) return null;
  const cell = row.firstElementChild;
  const links = cell.querySelectorAll('a[href]');
  if (links.length !== 1) return null;
  const [link] = links;
  if (plainText(cell) !== plainText(link)) return null;
  try {
    const url = new URL(link.href, window.location.href);
    if (!FAQ_FRAGMENT_PATH.test(url.pathname) || !url.hash) return null;
    return link;
  } catch {
    return null;
  }
}

/**
 * Fetches (once per path) a topic fragment and indexes its Q&A rows by question slug.
 * @param {string} path Fragment pathname
 * @returns {Promise<Map<string, Element[]>>} slug -> [question cell, answer cell]
 */
function loadTopic(path) {
  if (!fragmentCache.has(path)) {
    const promise = fetchPlain(path)
      .then((resp) => (resp.ok ? resp.text() : ''))
      .then((html) => {
        const index = new Map();
        if (!html) return index;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        // reset base path for media to the fragment base (same as the fragment block)
        doc.querySelectorAll('img[src^="./media_"], source[srcset^="./media_"]').forEach((el) => {
          const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
          const base = new URL(path, window.location);
          el.setAttribute(attr, new URL(el.getAttribute(attr), base).href);
        });
        doc.querySelectorAll('.accordion-faq > div').forEach((row) => {
          if (row.children.length < 2) return;
          const slug = questionSlug(row.children[0].textContent);
          if (slug && !index.has(slug)) index.set(slug, [...row.children]);
        });
        return index;
      })
      .catch(() => new Map());
    fragmentCache.set(path, promise);
  }
  return fragmentCache.get(path);
}

/**
 * Replaces reference rows with the referenced Q&A; unresolved references are removed.
 * @param {Element} block
 */
async function resolveReferences(block) {
  const refs = [...block.children]
    .map((row) => ({ row, link: getReferenceLink(row) }))
    .filter(({ link }) => link);
  await Promise.all(refs.map(async ({ row, link }) => {
    const url = new URL(link.href, window.location.href);
    const slug = decodeURIComponent(url.hash.substring(1));
    const index = await loadTopic(url.pathname);
    const cells = index.get(slug);
    if (!cells) {
      // eslint-disable-next-line no-console
      console.warn(`accordion-faq: reference ${url.pathname}#${slug} not found`);
      row.remove();
      return;
    }
    const [question, answer] = cells.map((cell) => document.importNode(cell, true));
    decorateIcons(answer);
    row.replaceChildren(question, answer);
    row.dataset.faqSource = `${url.pathname}#${slug}`;
  }));
}

function openFromHash(block) {
  const id = decodeURIComponent(window.location.hash.substring(1));
  if (!id) return;
  const item = block.querySelector(`details[id="${CSS.escape(id)}"]`);
  if (!item) return;
  item.open = true;
  // items inside fragments are decorated before they are attached: wait until connected
  let frames = 0;
  const scroll = () => {
    frames += 1;
    if (item.isConnected) item.scrollIntoView({ block: 'start' });
    else if (frames < 300) window.requestAnimationFrame(scroll);
  };
  window.requestAnimationFrame(scroll);
}

/**
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  await resolveReferences(block);

  const faqs = [];
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const body = row.children[1];
    if (!label || !body) {
      if (!plainText(row)) row.remove();
      return;
    }

    const question = plainText(label);
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(...label.childNodes);

    body.className = 'accordion-faq-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.id = uniqueId(questionSlug(question));
    if (row.dataset.faqSource) details.dataset.faqSource = row.dataset.faqSource;
    details.append(summary, body);
    row.replaceWith(details);

    faqs.push({ question, answer: plainText(body) });
  });

  // single-expand within the block
  block.addEventListener('toggle', (e) => {
    if (!e.target.open || !e.target.classList.contains('accordion-faq-item')) return;
    block.querySelectorAll('.accordion-faq-item[open]').forEach((item) => {
      if (item !== e.target) item.open = false;
    });
  }, true);

  upsertFaqJsonLd(faqs);

  openFromHash(block);
  window.addEventListener('hashchange', () => openFromHash(block));
}
