import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Cards (media): frameless cards, media above text. Extends the cards block (ul/li).
 * One row per card: [photo or icon image | eyebrow paragraph, heading, description, offer/CTA].
 *
 * Looks (block classes, set by the author or detected here):
 * - default: full-width photo above left-aligned text (easycare, cyberprotect, voip)
 * - icons: centered icon in a light rounded tile, centered text (caf-ii "How to qualify")
 * - icons panels: whole card is a light rounded panel with a small centered icon
 *   (satellite-internet "Why choose Viasat")
 */

const ICON_FILE = /\.(png|svg)$/i;

function isIconImage(img) {
  try {
    return ICON_FILE.test(new URL(img.getAttribute('src'), window.location.href).pathname);
  } catch (e) {
    return false;
  }
}

function optimizePictures(root) {
  root.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
}

function markParts(body) {
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  const children = [...body.children];
  children.slice(0, children.indexOf(heading)).forEach((el) => {
    if (el.tagName === 'P') el.classList.add('cards-media-eyebrow');
  });
  const last = body.lastElementChild;
  if (last && last !== heading && last.tagName === 'P' && last.querySelector('strong')
    && !last.classList.contains('button-wrapper')) {
    last.classList.add('cards-media-offer');
  }
}

/** Icon cards (all card images are PNG/SVG artwork); panels when they carry no links. */
function detectLook(block, ul) {
  const imgs = [...ul.querySelectorAll('.cards-media-card-image img')];
  if (!block.classList.contains('icons') && imgs.length && imgs.every(isIconImage)) {
    block.classList.add('icons');
  }
  if (block.classList.contains('icons') && !block.classList.contains('panels')
    && !ul.querySelector('.cards-media-card-body a')) {
    block.classList.add('panels');
  }
}

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector('picture') && !div.textContent.trim()) {
        div.className = 'cards-media-card-image';
      } else {
        div.className = 'cards-media-card-body';
        markParts(div);
      }
    });
    ul.append(li);
  });
  detectLook(block, ul);
  optimizePictures(ul);
  block.replaceChildren(ul);
}
