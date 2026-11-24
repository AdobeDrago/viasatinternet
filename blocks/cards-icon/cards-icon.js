import { decorateIcons } from '../../scripts/aem.js';

/*
 * Cards (icon): icon tiles. Extends the cards block (ul/li).
 * One row per tile, one cell: icon (e.g. :headset:) first, heading, text, optional link.
 * Looks (derived from the content, no authoring option needed):
 * - tiles with icons sit in one white rounded panel (3 per row, 4 per row for 4 or 8 tiles)
 * - tiles without icons are centered step cards with a CTA button
 * Option `centered`: centered cards with a large icon (CAF II "What is CAF II?").
 */

const ICON_TOKEN = /(:[a-z][a-z0-9-]*:)/;

/**
 * Turns literal ":name:" icon tokens (left as text when the content is served without the
 * document pipeline, e.g. local .plain.html) into EDS icon spans. Published content already
 * carries <span class="icon icon-name">, so this is a no-op there.
 * @param {Element} block The block element
 */
function decorateIconTokens(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (ICON_TOKEN.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  }
  nodes.forEach((node) => {
    const parts = node.nodeValue.split(ICON_TOKEN).filter((part) => part);
    node.replaceWith(...parts.map((part) => {
      const m = part.match(/^:([a-z][a-z0-9-]*):$/);
      if (!m) return part;
      const span = document.createElement('span');
      span.className = `icon icon-${m[1]}`;
      return span;
    }));
  });
  decorateIcons(block);
}

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  decorateIconTokens(block);

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-icon-card-body';
      // the first element holding only an icon is the tile icon
      const first = div.firstElementChild;
      if (first && first.querySelector('.icon') && !first.textContent.trim()) {
        first.classList.add('cards-icon-icon');
      }
      const last = div.lastElementChild;
      if (last && last !== first && last.querySelector('a[href]')) last.classList.add('cards-icon-link');
    });
    ul.append(li);
  });
  block.replaceChildren(ul);

  const count = ul.children.length;
  if (count % 4 === 0 && count % 3 !== 0) block.classList.add('cards-icon-4-cols');
  if (!block.querySelector('.cards-icon-icon')) block.classList.add('cards-icon-text-only');
}
