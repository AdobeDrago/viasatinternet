import { decorateIcons } from '../../scripts/aem.js';

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
  block.querySelectorAll('a[title]').forEach((a) => {
    a.title = a.title.replace(new RegExp(ICON_TOKEN.source, 'g'), '').trim();
  });
  decorateIcons(block);
}

/**
 * Columns (callout): extends the columns block (fixed side-by-side cells, never a wrapping grid).
 * Cell order follows the authored cells.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cols = [...(block.firstElementChild?.children || [])];
  block.classList.add(`columns-callout-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-callout-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && col.textContent.trim() === '') {
        col.classList.add('columns-callout-img-col');
      } else {
        col.classList.add('columns-callout-text-col');
      }
    });
  });

  // the cell holding only links/buttons is the action cell
  block.querySelectorAll('.columns-callout-text-col').forEach((col) => {
    const links = col.querySelectorAll('a');
    const linkText = [...links].map((a) => a.textContent).join('').replace(/\s+/g, '');
    if (links.length && col.textContent.replace(/\s+/g, '') === linkText) {
      col.classList.add('columns-callout-action-col');
    }
  });

  decorateIconTokens(block);
}
