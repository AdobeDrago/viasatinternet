/*
 * Icon, button and eyebrow helpers for a page template rebuilt from a source site.
 * Copied into the target repo by the eds-parity-rebuild skill; set the template name with
 * configureTemplate() (see starter/README.md).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
// Material Symbols "arrow_forward" (20px in the source's buttons)
const ARROW = 'm553.85-253.85-42.16-43.38L664.46-450H180v-60h484.46L511.69-662.77l42.16-43.38L780-480 553.85-253.85Z';

const config = {
  // body class of the template's pages (page metadata `template`, as decorateTemplateAndTheme
  // writes it); also the prefix of every class these helpers add, e.g. `landing-arrow`
  template: 'landing',
  // the arrow after button labels, drawn inline so it inherits currentColor ...
  arrow: { viewBox: '0 -960 960 960', path: ARROW },
  // ... or the name of an /icons file to inline instead (e.g. 'arrow-right')
  arrowIcon: null,
  // links into this path open a modal and get no arrow
  modalPath: '/modals/',
};

/**
 * Overrides the template defaults, e.g. configureTemplate({ template: 'product' }).
 * @param {object} options any of template, arrow, arrowIcon, modalPath
 */
export function configureTemplate(options) {
  Object.assign(config, options);
}

const cls = (name) => `${config.template}-${name}`;

/** Whether the current page uses the configured template. */
export const isTemplatePage = () => document.body.classList.contains(config.template);

const svgCache = {};

/**
 * Inline SVG from /icons, so it can take currentColor like the source's inline icons.
 * Returns a placeholder span that is swapped for the SVG once fetched.
 * @param {string} name icon file name without extension
 * @param {string} className class for the svg
 * @returns {HTMLElement}
 */
export function inlineIcon(name, className) {
  const span = document.createElement('span');
  span.className = className;
  svgCache[name] = svgCache[name] || fetch(`${window.hlx.codeBasePath}/icons/${name}.svg`)
    .then((r) => (r.ok ? r.text() : ''));
  svgCache[name].then((txt) => {
    if (!txt) return;
    const svg = new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement;
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    span.replaceWith(svg);
  });
  return span;
}

/**
 * The arrow the template puts after button labels (class `<template>-arrow`).
 * @returns {Element}
 */
export function arrowIcon() {
  if (config.arrowIcon) return inlineIcon(config.arrowIcon, cls('arrow'));
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', config.arrow.viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add(cls('arrow'));
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', config.arrow.path);
  svg.append(path);
  return svg;
}

/**
 * Template buttons: trimmed label followed by the arrow, as in the source markup.
 * An authored icon (e.g. `:download:`) replaces the arrow; modal links get none.
 * @param {Element} root
 */
export function decorateTemplateButtons(root) {
  root.querySelectorAll('a.button').forEach((a) => {
    if (a.querySelector(`.${cls('arrow')}`)) return;
    const icon = a.querySelector('.icon');
    const name = icon && [...icon.classList].find((c) => c.startsWith('icon-'));
    if (icon) icon.remove();
    // links that open a modal carry no arrow on the source
    if (!name && new URL(a.href, window.location).pathname.includes(config.modalPath)) {
      a.replaceChildren(a.textContent.trim());
      return;
    }
    a.replaceChildren(a.textContent.trim(), name ? inlineIcon(name.slice(5), cls('arrow')) : arrowIcon());
  });
}

/**
 * Wraps a button's label in a span, the way many source sites mark it up, so the label and
 * the button box carry separate styles.
 * @param {Element} root
 */
export function wrapButtonLabels(root) {
  root.querySelectorAll('a.button').forEach((a) => {
    if (a.querySelector('.button-text')) return;
    const span = document.createElement('span');
    span.className = 'button-text';
    span.append(...a.childNodes);
    // keep the whitespace a source often has between the label and an ::after arrow
    a.append(span, ' ');
  });
}

/**
 * Groups an eyebrow paragraph with the heading that follows it (`<template>-heading` holding
 * `<template>-eyebrow` and the heading), so section intros keep one gap between the heading
 * group and the lead text.
 * @param {Element} main
 */
export function groupEyebrows(main) {
  main.querySelectorAll('.default-content-wrapper > p + :is(h1, h2, h3)').forEach((h) => {
    const p = h.previousElementSibling;
    if (p.querySelector('a, img, picture')) return;
    const group = document.createElement('div');
    group.className = cls('heading');
    p.classList.add(cls('eyebrow'));
    p.before(group);
    group.append(p, h);
  });
}

/**
 * Template decoration for decorateMain: eyebrow groups and default-content buttons
 * (blocks decorate their own buttons). Does nothing on pages of other templates.
 * @param {Element} main
 */
export function decorateTemplate(main) {
  if (!isTemplatePage()) return;
  groupEyebrows(main);
  main.querySelectorAll('.default-content-wrapper').forEach(decorateTemplateButtons);
}
