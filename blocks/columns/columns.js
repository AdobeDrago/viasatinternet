import linkToImage from '../../scripts/media.js';
import { scene7Picture, isScene7 } from '../../scripts/scene7.js';

/**
 * Columns. Variants: media (image beside a text stack), reverse (image on the right),
 * badge (small award image beside a heading).
 * @param {Element} block columns block
 */
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const link = col.querySelector('a[href]');
      const isImage = link && !link.closest('strong, em') && col.children.length === 1
        && col.firstElementChild.querySelector('a') === link;
      if (isImage) {
        const img = isScene7(link.href) ? scene7Picture(link) : linkToImage(col);
        if (img) col.classList.add('columns-img-col');
      } else {
        col.classList.add('columns-text-col');
        col.querySelectorAll('p').forEach((p) => {
          const t = p.textContent.trim();
          if (t.startsWith('✓')) p.classList.add('columns-check');
          else if (t.startsWith('*')) p.classList.add('columns-legal');
        });
      }
      const pic = col.querySelector('picture');
      if (pic && !col.classList.contains('columns-img-col')) {
        col.classList.add('columns-img-col');
      }
    });
  });
}
