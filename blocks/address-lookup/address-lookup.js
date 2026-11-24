import { replaceLinkWithAddressForm } from '../../scripts/address-lookup.js';

/**
 * Address Lookup block.
 * Rows: prompt text (optional), link "Check availability" -> destination.
 * Options: `same-window` (open the destination in the current tab), `unit` (adds a unit field).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const link = block.querySelector('a[href]');
  const prompt = document.createElement('div');
  prompt.className = 'address-lookup-prompt';
  const action = document.createElement('div');
  action.className = 'address-lookup-lookup';

  if (link) {
    const holder = link.closest('p');
    action.append(holder && block.contains(holder) ? holder : link);
  }
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => prompt.append(...cell.childNodes));
  });

  if (link) {
    replaceLinkWithAddressForm(link, {
      target: block.classList.contains('same-window') ? '_self' : undefined,
      unitField: block.classList.contains('unit'),
    });
  }

  block.replaceChildren(...[prompt, action].filter((el) => el.textContent.trim() || el.querySelector('form')));
}
