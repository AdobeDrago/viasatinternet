/**
 * Accordion: each row is a question cell and an answer cell.
 * @param {Element} block accordion block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = [...row.children];
    const details = document.createElement('details');
    details.className = 'accordion-item';
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    const content = document.createElement('div');
    content.className = 'accordion-item-body';
    if (body) content.append(...body.childNodes);
    details.append(summary, content);
    row.replaceWith(details);
  });
}
