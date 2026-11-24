import { decorateIcons } from '../../scripts/aem.js';

/*
 * Table (comparison): plan / provider comparison chart. Extends the table block.
 * Row 1 = header: [title | column heading per plan]. Body rows: [feature label | value per plan].
 * A last row with an empty first cell is the CTA row.
 * Icon-only cells (:check:, :check-none:) get screen reader text.
 * Options: `highlight-1` .. `highlight-4` highlights that plan column
 * (1-based, label column excluded).
 *
 * Narrow layout (source "cards" mode): when a column would be narrower than 200px the chart
 * shows one plan at a time, with a segmented switcher under the title and every feature label
 * stacked above its value.
 */

const HIGHLIGHT = /^highlight-(\d+)$/;
const ICON_TOKEN = /(:[a-z][a-z0-9-]*:)/;
const ICON_LABELS = {
  check: 'Included',
  'check-none': 'Not included',
};
const DASH = /^[–—-]$/;
const PRICE = /^\$\d[\d.,]*\s*\/\s*mo/i;
const MIN_COLUMN_WIDTH = 200;
const COLUMN_GAP = 16;

/**
 * Turns literal ":name:" icon tokens (left as text when the content is served without the
 * document pipeline, e.g. local .plain.html) into EDS icon spans. Published content already
 * carries <span class="icon icon-name">, so this is a no-op there.
 * @param {Element} block The block element
 */
function decorateIconTokens(block) {
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    if (ICON_TOKEN.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode);
  }
  nodes.forEach((node) => {
    const parts = node.nodeValue.split(ICON_TOKEN).filter((part) => part);
    node.replaceWith(...parts.map((part) => {
      const m = part.match(/^:([a-z][a-z0-9-]*):$/);
      if (!m) return part;
      const span = document.createElement('span');
      span.className = `icon icon-${m[1]}`;
      return span;
    }));
  });
  decorateIcons(block);
}

function addIconText(cell) {
  if (cell.textContent.trim()) return;
  const icons = cell.querySelectorAll('.icon');
  if (icons.length !== 1) return;
  const name = [...icons[0].classList].find((c) => c.startsWith('icon-'))?.substring(5);
  const label = ICON_LABELS[name];
  if (!label) return;
  const text = document.createElement('span');
  text.className = 'table-comparison-sr-only';
  text.textContent = label;
  icons[0].after(text);
  cell.classList.add('table-comparison-icon-cell');
}

/** Marks value cells whose content needs a source text style the markup cannot express. */
function classifyValue(cell) {
  const text = cell.textContent.trim();
  if (DASH.test(text)) {
    cell.classList.add('table-comparison-dash');
    return;
  }
  const strong = cell.querySelector('strong');
  if (!strong) return;
  if (PRICE.test(strong.textContent.trim())) cell.classList.add('table-comparison-price');
  const p = strong.closest('p');
  if (p && !p.querySelector('a') && p.textContent.trim() !== strong.textContent.trim()) {
    p.classList.add('table-comparison-offer');
  }
}

function buildSwitcher(block, columns, onSelect) {
  const switcher = document.createElement('div');
  switcher.className = 'table-comparison-switcher';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Choose a column');
  columns.forEach((title, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = title || String(i + 1);
    button.dataset.column = String(i + 1);
    button.setAttribute('aria-pressed', String(i === 0));
    switcher.append(button);
  });
  switcher.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-column]');
    if (!button) return;
    onSelect(parseInt(button.dataset.column, 10));
  });
  block.append(switcher);
  return switcher;
}

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  decorateIconTokens(block);

  const highlight = [...block.classList]
    .map((c) => HIGHLIGHT.exec(c))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  table.append(thead, tbody);

  const rows = [...block.children];
  let columnCount = 0;
  const columnTitles = [];
  rows.forEach((child, i) => {
    const row = document.createElement('tr');
    const isHeader = i === 0;
    const cols = [...child.children];
    columnCount = Math.max(columnCount, cols.length);
    const isCtaRow = !isHeader && i === rows.length - 1 && cols.length > 1
      && !cols[0].textContent.trim() && cols.slice(1).some((col) => col.querySelector('a[href]'));
    if (isCtaRow) row.classList.add('table-comparison-cta-row');
    (isHeader ? thead : tbody).append(row);

    cols.forEach((col, colIdx) => {
      let cell;
      if (isHeader) {
        cell = document.createElement('th');
        cell.scope = 'col';
      } else if (colIdx === 0 && !isCtaRow) {
        cell = document.createElement('th');
        cell.scope = 'row';
      } else {
        cell = document.createElement('td');
      }
      cell.dataset.column = String(colIdx);
      if (colIdx === 0) cell.classList.add('table-comparison-label');
      if (isHeader && colIdx === 0) cell.classList.add('table-comparison-title');
      if (highlight.includes(colIdx)) cell.classList.add('table-comparison-highlight');
      const align = col.getAttribute('data-align');
      const valign = col.getAttribute('data-valign');
      if (align) cell.style.textAlign = align;
      if (valign) cell.style.verticalAlign = valign;
      cell.append(...col.childNodes);
      if (isHeader && colIdx > 0) {
        const name = cell.querySelector('strong, h2, h3, h4') || cell;
        columnTitles.push(name.textContent.trim());
      }
      if (!isHeader && colIdx > 0) {
        addIconText(cell);
        classifyValue(cell);
      }
      row.append(cell);
    });
  });

  // explicit roles keep the table semantics when the narrow layout flattens it (display: contents)
  table.setAttribute('role', 'table');
  [thead, tbody].forEach((group) => group.setAttribute('role', 'rowgroup'));
  table.querySelectorAll('tr').forEach((tr) => tr.setAttribute('role', 'row'));
  table.querySelectorAll('th[scope="col"]').forEach((th) => th.setAttribute('role', 'columnheader'));
  table.querySelectorAll('th[scope="row"]').forEach((th) => th.setAttribute('role', 'rowheader'));
  table.querySelectorAll('td').forEach((td) => td.setAttribute('role', 'cell'));

  block.replaceChildren(table);

  // narrow layout: one plan column at a time
  let active = 1;
  const select = (column) => {
    active = column;
    block.querySelectorAll('[data-column]').forEach((el) => {
      if (el.tagName === 'BUTTON') {
        el.setAttribute('aria-pressed', String(parseInt(el.dataset.column, 10) === active));
      } else {
        const col = parseInt(el.dataset.column, 10);
        el.classList.toggle('table-comparison-active', col === active);
      }
    });
    block.classList.toggle('table-comparison-active-highlight', highlight.includes(active));
  };
  if (columnTitles.length > 1) buildSwitcher(block, columnTitles, select);
  select(active);

  const updateLayout = () => {
    const width = block.clientWidth;
    if (!width) return;
    const columnWidth = (width - COLUMN_GAP * (columnCount - 1)) / columnCount;
    block.classList.toggle('table-comparison-cards', columnWidth < MIN_COLUMN_WIDTH);
  };
  updateLayout();
  new ResizeObserver(() => requestAnimationFrame(updateLayout)).observe(block);
}
