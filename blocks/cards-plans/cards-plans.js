import { upsertProductJsonLd } from '../../scripts/structured-data.js';

/*
 * Cards (plans): pricing cards without images. Extends the cards block (ul/li).
 * One row per plan, one cell: eyebrow, plan name (heading), "Starting at", price (strong),
 * term, feature list, tagline, icon note (e.g. :lock: price lock), CTA link.
 * Options: `featured-1` .. `featured-4` highlights that card (1-based).
 * Emits Product/Offer JSON-LD (#product-jsonld) for every plan with a price.
 */

const PRICE = /\$\s?(\d+(?:[.,]\d{1,2})?)/;
const FEATURED = /^featured-(\d+)$/;

function isLinkOnly(el) {
  const link = el.querySelector('a[href]');
  return el.tagName === 'P' && link && el.textContent.trim() === link.textContent.trim();
}

function decorateCard(li) {
  const body = li.querySelector('.cards-plans-card-body');
  if (!body) return null;
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const children = [...body.children];

  if (heading) {
    heading.classList.add('cards-plans-name');
    children.slice(0, children.indexOf(heading)).forEach((el) => {
      if (el.tagName === 'P') el.classList.add('cards-plans-eyebrow');
    });
  }

  const price = children.find((el) => el.tagName === 'P' && el.querySelector('strong') && PRICE.test(el.textContent));
  if (price) price.classList.add('cards-plans-price');

  const features = body.querySelector(':scope > ul');
  if (features) features.classList.add('cards-plans-features');

  const cta = body.querySelector(':scope > .button-wrapper')
    || [...children].reverse().find(isLinkOnly);
  if (cta) cta.classList.add('cards-plans-cta');

  body.querySelectorAll(':scope > p').forEach((p) => {
    if (p.querySelector('.icon') && p !== cta) p.classList.add('cards-plans-note');
  });

  const tagline = features
    ? [...body.querySelectorAll(':scope > ul ~ p')].find((p) => !p.className)
    : null;
  if (tagline) tagline.classList.add('cards-plans-tagline');

  if (!heading || !price) return null;
  const link = cta ? cta.querySelector('a[href]') : null;
  return {
    name: heading.textContent,
    price: PRICE.exec(price.textContent)[1].replace(',', '.'),
    priceCurrency: 'USD',
    description: tagline ? tagline.textContent : undefined,
    url: link ? link.href : undefined,
  };
}

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const featured = [...block.classList]
    .map((c) => FEATURED.exec(c))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10) - 1);

  const ul = document.createElement('ul');
  [...block.children].forEach((row, idx) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => { div.className = 'cards-plans-card-body'; });
    if (featured.includes(idx)) li.classList.add('cards-plans-featured');
    ul.append(li);
  });
  block.replaceChildren(ul);

  const products = [...ul.children].map(decorateCard).filter(Boolean);
  upsertProductJsonLd(products);
}
