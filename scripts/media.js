/*
 * Image and video helpers for blocks rebuilt from a source site.
 * Copied into the target repo by the eds-parity-rebuild skill; set the site's image hosts
 * with configureMedia() (see starter/README.md).
 */
import { loadCSS } from './aem.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const config = {
  // links to these hosts are images authored as links, so they stay out of the media bus;
  // a string matches as a substring of the href, a RegExp is tested against it
  imageHosts: ['scene7.com/is/image/', /\.adobeaemcloud\.com\/adobe\/assets\//],
  // links to files with these extensions are self-hosted images
  imageExtensions: ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'],
  // stylesheet openVideo() loads before showing the modal (relative to the code base path)
  modalStyles: '/styles/modal.css',
};

/**
 * Overrides the media defaults, e.g. configureMedia({ imageHosts: ['images.example.com'] }).
 * @param {object} options any of imageHosts, imageExtensions, modalStyles
 */
export function configureMedia(options) {
  Object.assign(config, options);
}

const matches = (href, pattern) => (pattern instanceof RegExp
  ? pattern.test(href) : href.includes(pattern));

function isImageLink(a) {
  if (config.imageHosts.some((pattern) => matches(a.href, pattern))) return true;
  const ext = /\.([a-z0-9]+)$/i.exec(new URL(a.href, window.location).pathname);
  return !!ext && config.imageExtensions.includes(ext[1].toLowerCase());
}

/**
 * The width parameter of a Dynamic Media URL: `width` on AEM Assets delivery, `wid` on
 * Scene7 image serving, or null for any other URL.
 * @param {URL} url
 * @returns {string|null}
 */
function widthParam(url) {
  if (url.pathname.includes('/adobe/assets/')) return 'width';
  if (url.pathname.includes('/is/image/')) return 'wid';
  return null;
}

/**
 * Images are authored as links to their Dynamic Media URL (Scene7, AEM Assets delivery, or
 * any configured host) or to a self-hosted file, so they are not copied into the media bus.
 * Converts the first such link in the container into an <img>.
 * @param {Element} container element holding the authored link
 * @param {object} [options]
 * @param {boolean} [options.eager] load eagerly (LCP image)
 * @param {Object<number, number>} [options.renditions] Dynamic Media only: rendition width
 *   per max viewport width, e.g. { 1024: 522, 1280: 650 } (the source component's breakpoints)
 * @returns {HTMLImageElement|null} the image, or null if no image link was found
 */
export default function linkToImage(container, { eager = false, renditions = null } = {}) {
  const a = [...container.querySelectorAll('a[href]')].find(isImageLink);
  if (!a) return null;
  const url = new URL(a.href);
  const label = a.textContent.trim();
  const img = document.createElement('img');
  img.src = a.href;
  // a bare pasted URL is not alt text
  img.alt = label === a.href ? '' : label;
  img.loading = eager ? 'eager' : 'lazy';
  if (eager) img.fetchPriority = 'high';
  const param = widthParam(url);
  // AEM Assets delivery URLs name the rendition (width + smartcrop ratio): reserve its box
  const crop = /^(\d+)x(\d+)$/.exec(url.searchParams.get('smartcrop') || '');
  const w = parseInt(url.searchParams.get('width'), 10);
  if (param === 'width' && crop && w) {
    img.width = w;
    img.height = Math.round((w * crop[2]) / crop[1]);
  }
  let el = img;
  if (renditions && param) {
    // a <picture> with the component's per-breakpoint renditions, smallest breakpoint first
    el = document.createElement('picture');
    Object.keys(renditions).map(Number).sort((x, y) => x - y).forEach((max) => {
      const u = new URL(a.href);
      u.searchParams.set(param, renditions[max]);
      // a fixed Scene7 height would letterbox the narrower rendition
      if (param === 'wid') u.searchParams.delete('hei');
      const source = document.createElement('source');
      source.media = `(max-width: ${max}px)`;
      source.srcset = u.href;
      el.append(source);
    });
    el.append(img);
  }
  const p = a.closest('p');
  (p && p.parentElement === container ? p : a).replaceWith(el);
  return img;
}

/**
 * Video providers, keyed by name. Each has a `pattern` whose first group is the video id
 * in an authored link, a `player` URL for the modal, a muted looping `background` URL, and an
 * optional `poster` image URL. Add a provider by adding a key.
 */
export const VIDEO_PROVIDERS = {
  vidyard: {
    pattern: /vidyard\.com\/(?:watch\/)?([A-Za-z0-9_-]{10,})/,
    player: (id) => `https://play.vidyard.com/${id}?disable_popouts=1&autoplay=1&type=inline`,
    background: (id) => `https://play.vidyard.com/${id}/type/background?disable_popouts=1&autoplay=1&type=inline&muted=1&loop=1&hidden_controls=1&disable_ctas=1&viral_sharing=0&embed_button=0`,
    poster: (id) => `https://play.vidyard.com/${id}.jpg`,
  },
  youtube: {
    pattern: /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    player: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
    background: (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&playsinline=1&rel=0`,
    poster: (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  },
  vimeo: {
    pattern: /vimeo\.com\/(?:[^?#]*\/)?(\d+)(?:$|[/?#])/,
    player: (id) => `https://player.vimeo.com/video/${id}?autoplay=1`,
    background: (id) => `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1`,
    // no public poster URL: author an image in the cell instead
    poster: null,
  },
};

/**
 * The provider and id of an authored video link.
 * @param {string} href
 * @returns {{provider: string, id: string}|null}
 */
export function videoSource(href) {
  let source = null;
  Object.entries(VIDEO_PROVIDERS).some(([provider, { pattern }]) => {
    const m = pattern.exec(href || '');
    if (m) source = { provider, id: m[1] };
    return !!m;
  });
  return source;
}

/**
 * The first link in an element that points to a known video provider.
 * @param {Element} el
 * @returns {HTMLAnchorElement|null}
 */
export function videoLink(el) {
  return (el && [...el.querySelectorAll('a[href]')].find((a) => videoSource(a.href))) || null;
}

/**
 * Muted, looping video background: the poster shows first and the player is added once the
 * page has loaded. An image authored in the cell is the poster; otherwise the provider's.
 * Returns null if the cell has no video link.
 * @param {Element} cell authored cell holding the video link
 * @returns {HTMLElement|null} the background layer (styled by .video-bg in modal.css)
 */
export function videoBackground(cell) {
  const link = videoLink(cell);
  if (!link) return null;
  const { provider, id } = videoSource(link.href);
  const { background, poster } = VIDEO_PROVIDERS[provider];
  const bg = document.createElement('div');
  bg.className = 'video-bg';
  const authored = cell.querySelector('picture, img');
  if (authored) {
    bg.append(authored);
  } else if (poster) {
    const img = document.createElement('img');
    img.src = poster(id);
    img.alt = '';
    img.loading = 'lazy';
    bg.append(img);
  }
  const start = () => {
    const iframe = document.createElement('iframe');
    iframe.src = background(id);
    iframe.title = link.textContent.trim() || 'Background video';
    iframe.allow = 'autoplay';
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    bg.append(iframe);
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  return bg;
}

const CLOSE = 'M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z';
const PLAY = 'M16 0C7.168 0 0 7.168 0 16C0 24.832 7.168 32 16 32C24.832 32 32 24.832 32 16C32 7.168 24.832 0 16 0ZM12.8 23.2V8.8L22.4 16L12.8 23.2Z';

function glyph(viewBox, d, cls) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add(cls);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  return svg;
}

/** A 32-unit filled play circle for video thumbnails (inherits currentColor via fill). */
export const playIcon = () => glyph('0 0 32 32', PLAY, 'video-play');

/**
 * Click-to-load player: opens a modal dialog and only then loads the player iframe;
 * the dialog and iframe are removed again on close.
 * @param {string|{provider: string, id: string}} source authored video link or videoSource()
 * @param {string} [title] accessible title for the player
 * @returns {Promise<HTMLDialogElement|null>} the dialog, or null for an unknown video link
 */
export async function openVideo(source, title) {
  const video = typeof source === 'string' ? videoSource(source) : source;
  if (!video) return null;
  await loadCSS(`${window.hlx.codeBasePath}${config.modalStyles}`);
  const dialog = document.createElement('dialog');
  dialog.className = 'video-modal';
  const panel = document.createElement('div');
  panel.className = 'video-modal-panel';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'video-modal-close';
  close.setAttribute('aria-label', 'Close video');
  close.append(glyph('0 -960 960 960', CLOSE, 'video-modal-close-icon'));
  const frame = document.createElement('div');
  frame.className = 'video-modal-frame';
  const iframe = document.createElement('iframe');
  iframe.src = VIDEO_PROVIDERS[video.provider].player(video.id);
  iframe.title = title || 'Video';
  iframe.allow = 'autoplay; fullscreen; picture-in-picture';
  iframe.allowFullscreen = true;
  frame.append(iframe);
  panel.append(close, frame);
  dialog.append(panel);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}
