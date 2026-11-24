import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';

const ICON_TOKEN = /(:[a-z][a-z0-9-]*:)/;

/*
 * Cards (addons): photo cards with title, description and an icon offer footer.
 * Extends the cards block (ul/li).
 * One row per card: [photo | heading, description, offer paragraph starting with an icon (:tag:)].
 */

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

/**
 * Turns literal ":name:" icon tokens (left as text when the content is served without the
 * document pipeline, e.g. local .plain.html) into EDS icon spans. Published content already
 * carries <span class="icon icon-name">, so this is a no-op there.
 * @param {Element} root
 */
function decorateIconTokens(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
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
  decorateIcons(root);
}

function markOffer(body) {
  const offer = [...body.querySelectorAll(':scope > p')]
    .reverse()
    .find((p) => p.firstElementChild && p.firstElementChild.classList.contains('icon'));
  if (offer) offer.classList.add('cards-addons-offer');
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
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-addons-card-image';
      } else {
        div.className = 'cards-addons-card-body';
        markOffer(div);
      }
    });
    ul.append(li);
  });
  optimizePictures(ul);
  block.replaceChildren(ul);
}
