import { getMetadata, decorateIcons } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(header, force) {
  const open = force ?? header.getAttribute('aria-expanded') !== 'true';
  header.setAttribute('aria-expanded', open);
  header.querySelector('.header-menu').setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

/**
 * Builds the header from the /nav fragment. Sections, in order:
 * utility links, utility end link, brand, main links, call button.
 * @param {Element} block header block
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const names = ['util', 'util-end', 'brand', 'sections', 'tools'];
  const nav = {};
  names.forEach((name, i) => {
    const el = sections[i];
    if (!el) return;
    el.className = `nav-${name}`;
    nav[name] = el;
  });
  decorateIcons(fragment);

  const bar = (cls, ...children) => {
    const outer = document.createElement('div');
    outer.className = cls;
    const inner = document.createElement('div');
    inner.className = 'header-bar';
    inner.append(...children.filter(Boolean));
    outer.append(inner);
    return outer;
  };

  const menu = document.createElement('button');
  menu.type = 'button';
  menu.className = 'header-menu';
  menu.setAttribute('aria-label', 'Open navigation');
  menu.innerHTML = '<span class="header-menu-icon"></span>';

  const utilWrap = document.createElement('div');
  utilWrap.className = 'header-util-links';
  utilWrap.append(...[nav.util, nav['util-end']].filter(Boolean));

  const nameFor = (el) => el && el.querySelector('a');
  [nav.brand, nav.sections, nav.tools].forEach((el) => {
    if (el) el.querySelectorAll('a').forEach((a) => { a.removeAttribute('title'); });
  });
  const brandLink = nameFor(nav.brand);
  if (brandLink) brandLink.setAttribute('aria-label', 'Viasat Satellite Internet');

  const wrapper = document.createElement('div');
  wrapper.className = 'header-inner';
  wrapper.append(
    bar('header-util', utilWrap),
    bar('header-main', nav.brand, nav.sections, nav.tools, menu),
  );
  block.append(wrapper);

  menu.addEventListener('click', () => toggleMenu(block.parentElement || block));
  isDesktop.addEventListener('change', () => toggleMenu(block.parentElement || block, false));
}
