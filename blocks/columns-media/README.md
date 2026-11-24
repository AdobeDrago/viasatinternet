# columns-media

Custom **columns** block. Purpose: White rounded card with an image and a text column side by side.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per card: [image | heading, paragraph, check-mark list, CTA, footnotes] or [text | image]; column order follows the cells on desktop, the image stacks first on mobile.

Text cell roles (set by `columns-media.js`, styled from the source):

- a paragraph above the heading is an eyebrow (`STEP 1`);
- a single paragraph of up to 200 characters between an h2 and the CTA is a subheading (20px bold);
- consecutive buttons are grouped in `.columns-media-actions`; a `tel:` button (bold link) next to the CTA renders as the source's bare "or call" link and the CTA uses the large button size;
- paragraphs after the buttons are footnotes (12px);
- list items render with a check mark.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Home and business feature cards (home), savings promo card (plans).

## Reuse guidance

Author as "Columns Media". List items render with a check mark.
