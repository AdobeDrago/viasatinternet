import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) on Escape
 * @param {KeyboardEvent} e keydown event
 */
function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

/**
 * Closes the open nav dropdown (desktop) or the nav menu (mobile) when focus leaves the nav
 * @param {FocusEvent} e focusout event
 */
function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean|string} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  // the desktop nav is always expanded, so aria-expanded only applies to the mobile menu
  if (isDesktop.matches) nav.removeAttribute('aria-expanded');
  else nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

// scroll offset (px) after which the utility bar collapses while scrolling down
const UTILITY_COLLAPSE_OFFSET = 10;

/**
 * Derives a site key from the nav path, e.g. /viasatinternet/nav -> "viasatinternet".
 * The local preview serves content under /content, which is ignored.
 * @param {string} navPath The nav fragment path
 * @returns {string} the first path segment, or '' for a root nav
 */
function getSiteKey(navPath) {
  const segments = navPath.replace(/^\/content(?=\/)/, '').split('/').filter(Boolean);
  return segments.length > 1 ? segments[0] : '';
}

/**
 * Resolves relative image references against the nav document location
 * (authored as images/x.svg next to the nav file).
 * @param {Element} nav The nav element
 * @param {string} navPath The nav fragment path
 */
function rebaseNavImages(nav, navPath) {
  const base = new URL(navPath.replace(/^\/content(?=\/)/, ''), window.location);
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (/^([a-z]+:|\/|\.\/media_)/i.test(src)) return;
    img.src = new URL(src, base).href;
  });
}

/**
 * Opens links to other hosts in a new tab and marks links to an ancestor of the current page.
 * @param {Element} container The element holding the links
 */
function decorateLinks(container) {
  const norm = (p) => p.replace(/^\/content(?=\/)/, '').replace(/\/index$|\/$/, '') || '/';
  const here = norm(window.location.pathname);
  container.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.href, window.location);
    if (url.protocol.startsWith('http') && url.host !== window.location.host) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      return;
    }
    const there = norm(url.pathname);
    if (there !== '/' && there !== here && here.startsWith(`${there}/`)) a.setAttribute('aria-current', 'true');
    if (there === here) a.setAttribute('aria-current', 'page');
  });
}

/**
 * Turns the brand link holding two images into a logo with a scrolled-state alternative.
 * @param {Element} navBrand The brand section
 */
function decorateBrandLogos(navBrand) {
  const images = navBrand.querySelectorAll('img');
  if (images.length < 2) return;
  images[0].classList.add('nav-brand-logo');
  images[1].classList.add('nav-brand-logo-alt');
  images[1].setAttribute('aria-hidden', 'true');
  images[1].alt = '';
}

/**
 * Builds a slide carousel from a list (one slide per list item) with previous/next controls.
 * @param {Element} list The list element
 * @returns {Element} the carousel element
 */
function buildListCarousel(list) {
  const carousel = document.createElement('div');
  carousel.className = 'nav-carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  const track = document.createElement('div');
  track.className = 'nav-carousel-track';
  const slides = document.createElement('div');
  slides.className = 'nav-carousel-slides';
  slides.setAttribute('aria-live', 'polite');
  [...list.children].forEach((item) => {
    const slide = document.createElement('div');
    slide.className = 'nav-carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.append(...item.childNodes);
    slides.append(slide);
  });
  track.append(slides);
  carousel.append(track);
  list.replaceWith(carousel);

  const count = slides.children.length;
  let index = 0;
  const show = (i) => {
    index = (i + count) % count;
    slides.style.transform = `translateX(-${index * 100}%)`;
    [...slides.children].forEach((slide, n) => {
      slide.setAttribute('aria-hidden', n !== index);
    });
  };
  if (count > 1) {
    [['prev', 'Previous slide', -1], ['next', 'Next slide', 1]].forEach(([dir, label, step]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `nav-carousel-arrow nav-carousel-${dir}`;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', () => show(index + step));
      carousel.append(button);
    });
  }
  show(0);
  return carousel;
}

/**
 * Builds the bar that is revealed under the header once the page is scrolled:
 * each block of content becomes a full-width row, a list becomes a carousel.
 * Fragment links in it are resolved by the fragment auto-block when the nav loads.
 * @param {Element} section The sticky section of the nav
 * @returns {Element} the sticky bar
 */
function buildStickyBar(section) {
  const bar = document.createElement('div');
  bar.className = 'nav-sticky-bar';
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  const lookup = document.createElement('div');
  lookup.className = 'nav-sticky-row nav-sticky-lookup';
  const offers = document.createElement('div');
  offers.className = 'nav-sticky-row nav-sticky-offers';
  // page metadata "Offers: off" shows the address bar without the offers strip
  const hideOffers = /^(off|false|no|hide|none)$/i.test(getMetadata('offers').trim());
  [...wrapper.children].forEach((child) => {
    if (child.matches('ul, ol')) {
      if (!hideOffers) offers.append(buildListCarousel(child));
    } else lookup.append(child);
  });
  [lookup, offers].forEach((row) => {
    if (row.children.length) bar.append(row);
  });
  return bar;
}

/**
 * Toggles the scrolled state (solid header, sticky bar) and collapses the
 * utility bar while scrolling down.
 * @param {Element} block The header block
 * @param {Element} nav The main nav bar, whose height is the scrolled threshold
 */
function watchScroll(block, nav) {
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    block.classList.toggle('is-scrolled', y > nav.offsetHeight);
    if (y <= UTILITY_COLLAPSE_OFFSET) block.classList.remove('is-utility-hidden');
    else if (y > lastY) block.classList.add('is-utility-hidden');
    else if (y < lastY) block.classList.remove('is-utility-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // optional 4th/5th nav sections: utility bar above, scroll-revealed sticky bar below
  const classes = ['brand', 'sections', 'tools', 'utility', 'sticky'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });
  const navUtility = nav.querySelector('.nav-utility');
  const navSticky = nav.querySelector('.nav-sticky');
  const extended = !!(navUtility || navSticky);
  if (extended) {
    const site = getSiteKey(navPath);
    block.classList.add('header-extended');
    if (site) block.classList.add(`header-${site}`);
    rebaseNavImages(nav, navPath);
    decorateLinks(nav);
  }

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }
  if (extended) decorateBrandLogos(navBrand);

  const navSections = nav.querySelector('.nav-sections');
  if (navSections && extended) {
    // pill links: label wrapped so the pill (link) and its label can be styled separately
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li > a').forEach((a) => {
      const label = document.createElement('span');
      label.className = 'nav-link-label';
      label.append(...a.childNodes);
      a.append(label);
    });
  }
  if (navSections) {
    // mark the link to the current page
    // "/x/index" and "/x/" are the same page; the local preview serves pages under /content
    const norm = (p) => p.replace(/^\/content(?=\/)/, '').replace(/\/index$|\/$/, '') || '/';
    const here = norm(window.location.pathname);
    navSections.querySelectorAll('a[href]').forEach((a) => {
      const there = norm(new URL(a.href, window.location).pathname);
      if (there === here) a.setAttribute('aria-current', 'page');
    });
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      const subList = navSection.querySelector(':scope > ul');
      if (!subList) return;
      navSection.classList.add('nav-drop');
      // wrap the dropdown label in a button so it is announced as expandable
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-expanded', false);
      [...navSection.childNodes].forEach((node) => {
        if (node !== subList) button.append(node);
      });
      navSection.prepend(button);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        if (isDesktop.matches) {
          button.focus();
          toggleAllNavSections(navSections);
        }
        button.setAttribute('aria-expanded', !expanded);
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  if (extended) {
    // full-width bar holding the (max-width) main nav, like the utility and sticky bars
    const navBar = document.createElement('div');
    navBar.className = 'nav-bar';
    navBar.append(nav);
    navWrapper.append(navBar);
  } else {
    navWrapper.append(nav);
  }
  if (navUtility) {
    // desktop: bar above the main bar; mobile: footer of the open menu
    const placeUtility = () => {
      if (isDesktop.matches) navWrapper.prepend(navUtility);
      else nav.append(navUtility);
    };
    placeUtility();
    isDesktop.addEventListener('change', placeUtility);
  }
  if (navSticky) {
    navSticky.remove();
    navWrapper.append(buildStickyBar(navSticky));
  }
  block.append(navWrapper);
  if (extended) watchScroll(block, nav);
}
