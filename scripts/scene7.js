/**
 * Scene7 pictures that follow the source site's breakpoint presets.
 * An image is authored as a link to its `A-Screen-Large` URL; this builds the <picture>
 * with the narrower presets (same names and sizes the source serves) as <source>s.
 */
const PRESETS = {
  standard: [
    [563, 'Banner-X-Small', 1692, 1692],
    [719, 'Banner-Small-Transition', 2000, 1456],
    [959, 'Banner-Medium', 1920, 1400],
    [1023, 'Banner-Large', 2000, 1000],
    [1199, 'Screen-Small', 2000, 1000],
    [1439, 'Screen-Medium', 2000, 1000],
  ],
  wide: [
    [563, 'Square-564', 1692, 1692],
    [719, 'Banner-Small-Transition', 2000, 1042],
    [767, 'Banner-Small', 2000, 1042],
    [959, 'Banner-Medium', 1920, 854],
    [1023, 'Banner-Large', 2000, 889],
    [1199, 'Screen-Small', 2000, 888],
    [1439, 'Screen-Medium', 2000, 756],
  ],
};

export const isScene7 = (href) => /scene7\.com\/is\/image\//.test(href);

/**
 * Replaces the authored link (or its paragraph) with a responsive <picture>.
 * @param {HTMLAnchorElement} a the authored link
 * @param {object} [options]
 * @param {boolean} [options.eager] load eagerly
 * @returns {HTMLImageElement}
 */
export function scene7Picture(a, { eager = false } = {}) {
  const url = new URL(a.href);
  const ts = url.searchParams.get('ts');
  const base = url.origin + url.pathname.replace(/:A-[\w-]+$/, '');
  const kind = /Man-in-office/.test(base) ? 'wide' : 'standard';
  const picture = document.createElement('picture');
  PRESETS[kind].forEach(([max, preset, wid, hei]) => {
    const source = document.createElement('source');
    source.media = `(max-width: ${max}px)`;
    source.srcset = `${base}:A-${preset}?wid=${wid}&hei=${hei}&fmt=avif&ts=${ts}`;
    picture.append(source);
  });
  const img = document.createElement('img');
  img.src = a.href;
  const label = a.textContent.trim();
  img.alt = label === a.href ? '' : label;
  img.loading = eager ? 'eager' : 'lazy';
  if (eager) img.fetchPriority = 'high';
  picture.append(img);
  const p = a.closest('p');
  (p && p.children.length === 1 ? p : a).replaceWith(picture);
  return img;
}
