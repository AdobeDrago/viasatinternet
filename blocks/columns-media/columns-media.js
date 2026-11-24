/**
 * Columns (media): extends the columns block (fixed side-by-side cells, never a wrapping grid).
 * Cell order follows the authored cells.
 * @param {Element} block The block element
 */

// a lone paragraph under the heading up to this length is a subheading (source heading-md)
const LEAD_MAX_LENGTH = 200;

const isButton = (el) => el.classList.contains('button-wrapper');
const isHeading = (el) => /^H[1-6]$/.test(el.tagName);

/**
 * Names the text cell parts the source styles differently:
 * eyebrow (paragraph above the heading), lead (a short lone paragraph under an h2),
 * actions (consecutive buttons) and notes (paragraphs after the buttons).
 * @param {Element} col The text cell
 */
function decorateText(col) {
  const children = [...col.children];
  const headingIndex = children.findIndex(isHeading);

  if (headingIndex > 0) {
    children.slice(0, headingIndex)
      .filter((el) => el.tagName === 'P' && !isButton(el))
      .forEach((el) => el.classList.add('columns-media-eyebrow'));
  }

  const firstButton = children.findIndex(isButton);
  if (firstButton >= 0) {
    children.slice(firstButton)
      .filter((el) => el.tagName === 'P' && !isButton(el))
      .forEach((el) => el.classList.add('columns-media-note'));
  }

  const heading = children[headingIndex];
  if (heading && heading.tagName === 'H2') {
    const end = firstButton > headingIndex ? firstButton : children.length;
    const body = children.slice(headingIndex + 1, end);
    const [p] = body;
    if (body.length === 1 && p.tagName === 'P' && p.textContent.trim().length <= LEAD_MAX_LENGTH) {
      p.classList.add('columns-media-lead');
    }
  }

  // group consecutive buttons into one actions row
  children.filter(isButton).forEach((btn) => {
    const prev = btn.previousElementSibling;
    if (prev && prev.classList.contains('columns-media-actions')) {
      prev.append(btn);
    } else {
      const actions = document.createElement('div');
      actions.className = 'columns-media-actions';
      btn.before(actions);
      actions.append(btn);
    }
  });
}

export default function decorate(block) {
  const cols = [...(block.firstElementChild?.children || [])];
  block.classList.add(`columns-media-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-media-row');
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && col.children.length === 1 && col.textContent.trim() === '') {
        col.classList.add('columns-media-img-col');
      } else {
        col.classList.add('columns-media-text-col');
        decorateText(col);
      }
    });
  });

  // a text cell before the image cell: image sits on the right on desktop
  block.querySelectorAll('.columns-media-row').forEach((row) => {
    const first = row.firstElementChild;
    if (first && first.classList.contains('columns-media-text-col') && row.querySelector('.columns-media-img-col')) {
      row.classList.add('columns-media-img-right');
    }
  });
}
