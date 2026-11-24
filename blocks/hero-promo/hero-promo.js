/**
 * Hero (promo): rounded promo banner with background image and two text groups.
 * Content cell: [heading + CTA] then [second heading + disclaimer]; the group split is
 * made at the second heading. Rows are [background image] and [content].
 * @param {Element} block The block element
 */
export default function decorate(block) {
  let media;
  const nodes = [];

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (!media && cell.querySelector('picture') && cell.textContent.trim() === '') {
        media = cell;
      } else {
        nodes.push(...cell.childNodes);
      }
    });
  });

  const content = document.createElement('div');
  content.className = 'hero-promo-content';
  content.append(...nodes);

  if (!media) {
    const pic = content.querySelector('picture');
    if (pic) {
      media = document.createElement('div');
      const holder = pic.closest('p');
      media.append(pic);
      if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    }
  }
  if (media) media.className = 'hero-promo-media';

  const offer = document.createElement('div');
  offer.className = 'hero-promo-offer';
  const savings = document.createElement('div');
  savings.className = 'hero-promo-savings';
  const headings = content.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4');
  const split = headings[1];
  let target = offer;
  [...content.children].forEach((el) => {
    if (el === split) target = savings;
    target.append(el);
  });
  content.replaceChildren(...[offer, savings].filter((g) => g.children.length));

  block.replaceChildren(...[media, content].filter(Boolean));
}
