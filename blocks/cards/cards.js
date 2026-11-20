import linkToImage from '../../scripts/media.js';

const ARROW = 'm313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z';

function arrowButton(dir) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `cards-nav cards-${dir}`;
  btn.setAttribute('aria-label', dir === 'prev' ? 'Previous' : 'Next');
  btn.innerHTML = `<svg viewBox="0 -960 960 960" aria-hidden="true"><path d="${ARROW}"/></svg>`;
  return btn;
}

/**
 * Cards. Variant: carousel (horizontally scrolling cards with prev/next buttons).
 * Each row: image link cell, then text cell (title paragraph, description paragraph).
 * @param {Element} block cards block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const [first, second] = [...row.children];
    const text = document.createElement('div');
    text.className = 'cards-card-body';
    const media = document.createElement('div');
    media.className = 'cards-card-image';
    [first, second].filter(Boolean).forEach((cell) => {
      if (cell.querySelector('a[href]') && !cell.querySelector('strong') && cell.children.length === 1) {
        const img = linkToImage(cell);
        if (img) media.append(img);
      } else {
        text.append(...cell.childNodes);
      }
      if (cell.querySelector('picture') && !media.firstChild) media.append(cell.querySelector('picture'));
    });
    const title = text.querySelector('strong');
    if (title) {
      const p = title.closest('p');
      p.className = 'cards-card-title';
      p.textContent = title.textContent;
    }
    li.append(text, media);
    ul.append(li);
  });
  block.replaceChildren(ul);

  if (block.classList.contains('carousel')) {
    const prev = arrowButton('prev');
    const next = arrowButton('next');
    const step = () => {
      const card = ul.querySelector('li');
      const gap = parseFloat(getComputedStyle(ul).columnGap) || 0;
      return card.getBoundingClientRect().width + gap;
    };
    prev.addEventListener('click', () => ul.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => ul.scrollBy({ left: step(), behavior: 'smooth' }));
    const nav = document.createElement('div');
    nav.className = 'cards-controls';
    nav.append(prev, next);
    block.append(nav);
  }
}
