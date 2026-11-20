import { scene7Picture } from '../../scripts/scene7.js';

/**
 * Hero: row 1 holds the background image link, row 2 the content.
 * Variants: search (home hero with address field), banner (card with two text columns),
 * center (full-bleed image, centered copy).
 * @param {Element} block hero block
 */
export default function decorate(block) {
  const [imageRow, contentRow] = [...block.children];
  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  const link = imageRow.querySelector('a[href]');
  const img = link && scene7Picture(link, { eager: block.classList.contains('search') });
  if (img) bg.append(imageRow.querySelector('picture') || img);
  const content = document.createElement('div');
  content.className = 'hero-content';
  if (contentRow) {
    [...contentRow.children].forEach((cell) => {
      cell.className = 'hero-cell';
      content.append(cell);
    });
  }
  block.replaceChildren(bg, content);

  if (block.classList.contains('search')) {
    const cell = content.firstElementChild;
    const placeholder = [...cell.querySelectorAll('p')].find((p) => !p.querySelector('a, strong') && p.textContent.trim() === 'Enter your address');
    const button = cell.querySelector('p.button-wrapper');
    if (placeholder && button) {
      const form = document.createElement('form');
      form.className = 'hero-search';
      form.addEventListener('submit', (e) => e.preventDefault());
      const field = document.createElement('div');
      field.className = 'hero-field';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = placeholder.textContent.trim();
      input.setAttribute('aria-label', placeholder.textContent.trim());
      field.append(input);
      const label = button.querySelector('a');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button primary';
      btn.append(...label.childNodes);
      form.append(field, btn);
      placeholder.replaceWith(form);
      button.remove();
    }
    const last = [...cell.children].pop();
    if (last && last.tagName === 'P') last.classList.add('hero-legal');
  }
  if (block.classList.contains('banner')) {
    block.querySelectorAll('.hero-cell p').forEach((p) => {
      if (p.textContent.trim().startsWith('*')) p.classList.add('hero-legal');
    });
  }
}
