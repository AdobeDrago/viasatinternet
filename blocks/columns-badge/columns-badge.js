/**
 * Columns (badge): extends the columns block (fixed side-by-side cells, never a wrapping grid).
 * Cell order follows the authored cells.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cols = [...(block.firstElementChild?.children || [])];
  block.classList.add(`columns-badge-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-badge-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && col.textContent.trim() === '') {
        col.classList.add('columns-badge-img-col');
      } else {
        col.classList.add('columns-badge-text-col');
      }
    });
  });
}
