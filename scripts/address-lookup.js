/*
 * Shared address lookup form.
 * Used by the address-lookup block and the hero-lookup block.
 *
 * The authored link is the contract: its href is the destination, its text the submit label.
 * On submit the address is passed through as query parameters (no autocomplete):
 *   addressLine1 = address field, addressLine2 = unit field (when present and filled),
 *   countryCode=US is added for buy.viasat.com unless the destination already has one.
 * Cross-host destinations open in a new tab unless a target is set explicitly.
 */

import { loadCSS } from './aem.js';

const BUY_VIASAT_HOST = 'buy.viasat.com';
const REQUIRED_MESSAGE = 'Enter your address';

let formCount = 0;

/**
 * Builds the lookup URL from the destination and the entered address.
 * @param {string} destination Absolute or relative destination URL
 * @param {string} addressLine1 Street address
 * @param {string} [addressLine2] Unit / apartment
 * @returns {URL}
 */
export function buildLookupUrl(destination, addressLine1, addressLine2 = '') {
  const url = new URL(destination, window.location.href);
  if (url.hostname === BUY_VIASAT_HOST && !url.searchParams.has('countryCode')) {
    url.searchParams.set('countryCode', 'US');
  }
  url.searchParams.set('addressLine1', addressLine1);
  if (addressLine2) url.searchParams.set('addressLine2', addressLine2);
  return url;
}

/**
 * Resolves the window target for a destination.
 * @param {URL} url The lookup URL
 * @param {string} [target] Explicit target (`_self`, `_blank`), wins when set
 * @returns {string}
 */
export function resolveTarget(url, target) {
  if (target) return target;
  return url.host !== window.location.host ? '_blank' : '_self';
}

function createField(id, name, labelText, autocomplete) {
  const wrapper = document.createElement('div');
  wrapper.className = 'address-lookup-field';
  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'address-lookup-label';
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'text';
  input.id = id;
  input.name = name;
  input.placeholder = labelText;
  input.autocomplete = autocomplete;
  wrapper.append(label, input);
  return { wrapper, input };
}

/**
 * Builds an address lookup form from an authored link.
 * @param {HTMLAnchorElement} link Link whose href is the destination and text the submit label
 * @param {object} [options]
 * @param {string} [options.target] Explicit window target; defaults to the link's target attribute
 * @param {boolean} [options.unitField] Adds the optional unit (addressLine2) field
 * @param {string} [options.placeholder] Address field label/placeholder
 * @param {string} [options.unitPlaceholder] Unit field label/placeholder
 * @returns {HTMLFormElement}
 */
export function buildAddressForm(link, options = {}) {
  loadCSS(`${window.hlx.codeBasePath}/styles/address-lookup.css`);
  formCount += 1;
  const idPrefix = `address-lookup-${formCount}`;
  const destination = link.href;
  const target = options.target || link.getAttribute('target') || '';

  const form = document.createElement('form');
  form.className = 'address-lookup-form';
  form.noValidate = true;
  form.dataset.destination = destination;
  if (target) form.dataset.target = target;

  const fields = document.createElement('div');
  fields.className = 'address-lookup-fields';

  const address = createField(`${idPrefix}-address`, 'addressLine1', options.placeholder || 'Enter your address', 'address-line1');
  address.input.required = true;
  fields.append(address.wrapper);

  let unit;
  if (options.unitField) {
    unit = createField(`${idPrefix}-unit`, 'addressLine2', options.unitPlaceholder || 'Apt / Unit (optional)', 'address-line2');
    unit.wrapper.classList.add('address-lookup-field-unit');
    fields.append(unit.wrapper);
  }

  const message = document.createElement('p');
  message.className = 'address-lookup-message';
  message.id = `${idPrefix}-message`;
  message.setAttribute('aria-live', 'polite');
  message.hidden = true;
  address.input.setAttribute('aria-describedby', message.id);

  const action = document.createElement('div');
  action.className = 'address-lookup-action';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button primary';
  button.textContent = link.textContent.trim() || 'Check availability';
  action.append(button);

  form.append(fields, action, message);

  const showError = (show) => {
    message.hidden = !show;
    message.textContent = show ? REQUIRED_MESSAGE : '';
    form.classList.toggle('address-lookup-invalid', show);
    if (show) address.input.setAttribute('aria-invalid', 'true');
    else address.input.removeAttribute('aria-invalid');
  };

  address.input.addEventListener('input', () => {
    if (address.input.value.trim()) showError(false);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const addressLine1 = address.input.value.trim();
    if (!addressLine1) {
      showError(true);
      address.input.focus();
      return;
    }
    showError(false);
    const url = buildLookupUrl(destination, addressLine1, unit ? unit.input.value.trim() : '');
    if (resolveTarget(url, target) === '_blank') {
      window.open(url.href, '_blank', 'noopener');
    } else {
      window.location.assign(url.href);
    }
  });

  return form;
}

/**
 * Replaces a link (or the paragraph that only holds it) with an address lookup form.
 * @param {HTMLAnchorElement} link The authored link
 * @param {object} [options] See buildAddressForm
 * @returns {HTMLFormElement}
 */
export function replaceLinkWithAddressForm(link, options = {}) {
  const form = buildAddressForm(link, options);
  const holder = link.closest('p');
  if (holder && holder.textContent.trim() === link.textContent.trim()) holder.replaceWith(form);
  else link.replaceWith(form);
  return form;
}
