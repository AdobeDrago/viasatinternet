import { replaceLinkWithAddressForm } from '../../scripts/address-lookup.js';

const LOOKUP_TEXT = 'check availability';

/**
 * Whether a link is the address lookup trigger: text "Check availability"
 * pointing at buy.viasat.com/en-US/r/. Other CTAs (also to buy.viasat.com) stay buttons.
 * @param {HTMLAnchorElement} link
 * @returns {boolean}
 */
function isLookupLink(link) {
  if (link.textContent.replace(/\s+/g, ' ').trim().toLowerCase() !== LOOKUP_TEXT) return false;
  try {
    const url = new URL(link.href);
    return url.hostname === 'buy.viasat.com' && /^\/en-us\/r(\/|$)/i.test(url.pathname);
  } catch {
    return false;
  }
}

/**
 * Hero (lookup): background photo + h1, subheading, address lookup form, disclaimer.
 * Extends the hero block: rows are [background image] and [content].
 * Options: `left` (left-aligned content column instead of centered).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const content = document.createElement('div');
  content.className = 'hero-lookup-content';
  let media;

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !media && cell.textContent.trim() === '') {
        media = cell;
        media.className = 'hero-lookup-media';
      } else {
        content.append(...cell.childNodes);
      }
    });
  });

  if (!media) {
    // picture authored inside the content cell (boilerplate hero layout)
    const pic = content.querySelector('picture');
    if (pic) {
      media = document.createElement('div');
      media.className = 'hero-lookup-media';
      const holder = pic.closest('p');
      media.append(pic);
      if (holder && !holder.textContent.trim() && !holder.children.length) holder.remove();
    }
  }

  [...content.querySelectorAll('a[href]')].filter(isLookupLink).forEach((link) => {
    // source hero forms submit in the same window (data-target="_self" on viasatinternet.com)
    replaceLinkWithAddressForm(link, { target: '_self' });
  });

  // everything after the last action (form or button) is the disclaimer
  const actions = content.querySelectorAll(':scope > form, :scope > .button-wrapper');
  const lastAction = actions[actions.length - 1];
  if (lastAction) {
    let next = lastAction.nextElementSibling;
    while (next) {
      if (next.tagName === 'P') next.classList.add('hero-lookup-disclaimer');
      next = next.nextElementSibling;
    }
  }

  block.replaceChildren(...[media, content].filter(Boolean));
}
