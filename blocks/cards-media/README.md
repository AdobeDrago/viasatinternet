# cards-media

Custom **cards** block. Purpose: Frameless cards: rounded photo above eyebrow, title, description and bold offer line.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per card: [photo | eyebrow paragraph, h3 title, description paragraph, offer paragraph with strong].

## Supported variations

- default: full-width photo above left-aligned text (easycare, cyberprotect, voip). The photo keeps
  its own aspect ratio (square or 16:9).
- `icons`: centered artwork in a light rounded tile, centered text, CTA pinned to the card bottom
  (caf-ii "How to qualify").
- `icons, panels`: the whole card is a light rounded panel with a small (78px) centered icon
  (satellite-internet "Why choose Viasat").

The block JS adds `icons` automatically when every card image is a PNG/SVG file (photos are JPEG),
and `panels` when icon cards contain no links. Authors can set them explicitly as
"Cards Media (icons)" or "Cards Media (icons, panels)".

## Universal Editor fields

N/A (Document Authoring project)

## Usage

EasyCare option cards; also satellite-internet, cyberprotect, caf-ii, rural-internet.

## Reuse guidance

Author as "Cards Media". Paragraphs before the heading are eyebrows; a last paragraph containing strong is the offer line.
