import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Builds the footer from the /footer fragment. Sections: brand + link columns, legal row.
 * @param {Element} block footer block
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;
  decorateIcons(fragment);

  fragment.querySelectorAll('a').forEach((a) => {
    const t = a.textContent.trim();
    if (/\.svg$/.test(t)) {
      const img = document.createElement('img');
      img.src = t;
      img.alt = 'Accessibility tools';
      img.loading = 'lazy';
      a.replaceChildren(img);
    }
  });

  const [main, legal] = [...fragment.querySelectorAll(':scope > .section')];
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  if (main) {
    main.classList.add('footer-main');
    const brand = main.querySelector('p:has(.icon)');
    if (brand) brand.classList.add('footer-brand');
    const cols = main.querySelector('ul');
    if (cols) cols.classList.add('footer-columns');
  }
  if (legal) legal.classList.add('footer-legal');
  footer.append(...[main, legal].filter(Boolean));
  block.append(footer);
}
