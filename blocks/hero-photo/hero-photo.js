/**
 * Hero (photo): full-bleed background photo with centered heading, optional text and CTA(s).
 * Extends the hero block: rows are [background image] and [content].
 * @param {Element} block The block element
 */
export default function decorate(block) {
  let media;
  const content = document.createElement('div');
  content.className = 'hero-photo-content';

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (!media && cell.querySelector('picture') && cell.textContent.trim() === '') {
        media = cell;
      } else {
        content.append(...cell.childNodes);
      }
    });
  });

  if (!media) {
    const pic = content.querySelector('picture');
    if (pic) {
      media = document.createElement('div');
      const holder = pic.closest('p');
      media.append(pic);
      if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    }
  }
  if (media) media.className = 'hero-photo-media';

  // group consecutive buttons so multiple CTAs stack/align together
  const buttons = [...content.querySelectorAll(':scope > .button-wrapper')];
  if (buttons.length) {
    const group = document.createElement('div');
    group.className = 'hero-photo-actions';
    buttons[0].before(group);
    group.append(...buttons);
  }

  block.replaceChildren(...[media, content].filter(Boolean));
}
