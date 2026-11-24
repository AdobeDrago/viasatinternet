import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// sites (first footer path segment) whose footer document uses the banded layout:
// brand | link columns | bottom bar. Other footers keep the default rendering.
const BANDED_FOOTER_SITES = ['viasatinternet'];

/**
 * Derives a site key from the footer path, e.g. /viasatinternet/footer -> "viasatinternet".
 * The local preview serves content under /content, which is ignored.
 * @param {string} footerPath The footer fragment path
 * @returns {string} the first path segment, or '' for a root footer
 */
function getSiteKey(footerPath) {
  const segments = footerPath.replace(/^\/content(?=\/)/, '').split('/').filter(Boolean);
  return segments.length > 1 ? segments[0] : '';
}

/**
 * Resolves relative image references against the footer document location
 * (authored as images/x.svg next to the footer file).
 * @param {Element} container The element holding the images
 * @param {string} footerPath The footer fragment path
 */
function rebaseImages(container, footerPath) {
  const base = new URL(footerPath.replace(/^\/content(?=\/)/, ''), window.location);
  container.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (/^([a-z]+:|\/|\.\/media_)/i.test(src)) return;
    img.src = new URL(src, base).href;
  });
}

/**
 * Opens links to other hosts in a new tab, keeps the label width stable for the bold hover
 * state and turns placeholder (#) links into consent-preference triggers.
 * @param {Element} container The element holding the links
 */
function decorateLinks(container) {
  container.querySelectorAll('a[href]').forEach((a) => {
    const label = a.textContent.trim();
    if (label) a.dataset.label = label;
    if (a.getAttribute('href') === '#') {
      // hook used by consent platforms (OneTrust) to open the preference center
      a.classList.add('ot-sdk-show-settings');
      a.setAttribute('role', 'button');
      a.addEventListener('click', (e) => e.preventDefault());
      return;
    }
    const url = new URL(a.href, window.location);
    if (url.protocol.startsWith('http') && url.host !== window.location.host) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/**
 * Replaces an authored copyright year (© 2025) with the current year.
 * @param {Element} container The element holding the copyright text
 */
function updateCopyrightYear(container) {
  const year = String(new Date().getFullYear());
  container.querySelectorAll('p').forEach((p) => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      node.textContent = node.textContent.replace(/(©\s*)\d{4}/, `$1${year}`);
    }
  });
}

// below this width link columns collapse into accordions
const ACCORDION_MEDIA = window.matchMedia('(width < 600px)');

// column toggle button -> panel it controls (the footer is built before it is attached)
const COLUMN_PANELS = new WeakMap();

/**
 * Opens or closes a link column panel.
 * @param {Element} toggle The column toggle button
 * @param {boolean} expanded Whether the panel is open
 */
function setColumnExpanded(toggle, expanded) {
  const panel = COLUMN_PANELS.get(toggle);
  toggle.setAttribute('aria-expanded', String(expanded));
  if (panel) panel.inert = !expanded;
}

/**
 * Switches column toggles between accordion mode (small screens) and static columns.
 * @param {Element[]} toggles The column toggle buttons
 */
function applyColumnMode(toggles) {
  const accordion = ACCORDION_MEDIA.matches;
  toggles.forEach((toggle) => {
    toggle.disabled = !accordion;
    setColumnExpanded(toggle, accordion ? toggle.dataset.open === 'true' : true);
  });
}

/**
 * Groups every heading with the list that follows it into a link column; on small
 * screens the heading toggles the list (several columns can be open at once).
 * @param {Element} wrapper The content wrapper holding headings and lists
 * @param {string} prefix Class prefix
 * @param {string} idBase Base for generated panel ids
 * @returns {Element[]} the columns
 */
function buildLinkColumns(wrapper, prefix, idBase) {
  const columns = [];
  const toggles = [];
  [...wrapper.querySelectorAll(':scope > h2, :scope > h3, :scope > h4')].forEach((heading, i) => {
    const col = document.createElement('div');
    col.className = `${prefix}-col`;
    heading.className = `${prefix}-col-title`;
    const list = heading.nextElementSibling;
    heading.before(col);
    col.append(heading);
    if (list && list.tagName === 'UL') {
      const panel = document.createElement('div');
      panel.className = `${prefix}-col-panel`;
      panel.id = `${idBase}-panel-${i}`;
      list.className = `${prefix}-col-links`;
      panel.append(list);
      col.append(panel);

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = `${prefix}-col-toggle`;
      toggle.setAttribute('aria-controls', panel.id);
      COLUMN_PANELS.set(toggle, panel);
      toggle.append(...heading.childNodes);
      const chevron = document.createElement('span');
      chevron.className = `${prefix}-col-chevron`;
      chevron.setAttribute('aria-hidden', 'true');
      toggle.append(chevron);
      heading.append(toggle);
      toggle.addEventListener('click', () => {
        toggle.dataset.open = String(toggle.getAttribute('aria-expanded') !== 'true');
        setColumnExpanded(toggle, toggle.dataset.open === 'true');
      });
      toggles.push(toggle);
    }
    columns.push(col);
  });
  applyColumnMode(toggles);
  ACCORDION_MEDIA.addEventListener('change', () => applyColumnMode(toggles));
  return columns;
}

/**
 * Lays out a three-part footer (brand, link columns, bottom bar) into a main band
 * and a bottom band.
 * @param {Element} footer The footer content element
 * @param {string} prefix Class prefix
 */
function buildBandedFooter(footer, prefix) {
  const [brand, menu, bottom] = footer.querySelectorAll(':scope > .section');
  const main = document.createElement('div');
  main.className = `${prefix}-main`;
  const mainInner = document.createElement('div');
  mainInner.className = `${prefix}-inner`;
  main.append(mainInner);

  if (brand) {
    brand.classList.add(`${prefix}-brand`);
    mainInner.append(brand);
  }
  if (menu) {
    menu.classList.add(`${prefix}-menu`);
    const wrapper = menu.querySelector('.default-content-wrapper') || menu;
    buildLinkColumns(wrapper, prefix, `${prefix}-menu`);
    mainInner.append(menu);
  }
  footer.prepend(main);

  if (bottom) {
    const bar = document.createElement('div');
    bar.className = `${prefix}-bar`;
    const barInner = document.createElement('div');
    barInner.className = `${prefix}-inner`;
    bar.append(barInner);
    bottom.classList.add(`${prefix}-bottom`);
    const wrapper = bottom.querySelector('.default-content-wrapper') || bottom;
    const end = document.createElement('div');
    end.className = `${prefix}-bottom-end`;
    [...wrapper.children].forEach((el) => {
      if (el.tagName === 'UL') {
        el.className = `${prefix}-legal`;
        end.append(el);
      } else if (el.querySelector('img')) {
        el.className = `${prefix}-badge`;
        end.append(el);
      } else if (el.tagName === 'P') {
        el.className = `${prefix}-copyright`;
      }
    });
    wrapper.append(end);
    barInner.append(bottom);
    main.after(bar);
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const site = getSiteKey(footerPath);
  if (BANDED_FOOTER_SITES.includes(site)) {
    const prefix = 'footer';
    block.classList.add(`footer-${site}`);
    rebaseImages(footer, footerPath);
    decorateLinks(footer);
    updateCopyrightYear(footer);
    buildBandedFooter(footer, prefix);
  }

  block.append(footer);
}
