/**
 * Fetches the `.plain.html` of a content path (fragments, FAQ topics).
 *
 * On Edge Delivery the path resolves as authored (e.g. /viasatinternet/fragments/faq/about).
 * The local preview serves imported content under /content/..., so when the page itself is
 * served from /content/ and the plain request 404s, the same path is retried under /content.
 * @param {string} path Root-relative content path, without extension
 * @returns {Promise<Response>}
 */
export default async function fetchPlain(path) {
  const resp = await fetch(`${path}.plain.html`);
  if (resp.ok || resp.status !== 404) return resp;
  const prefix = '/content';
  if (window.location.pathname.startsWith(`${prefix}/`) && !path.startsWith(`${prefix}/`)) {
    const local = await fetch(`${prefix}${path}.plain.html`);
    if (local.ok) return local;
  }
  return resp;
}
