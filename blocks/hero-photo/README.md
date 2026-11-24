# hero-photo

Custom **hero** block. Purpose: Full-bleed photo banner with centered heading, optional text and one or more CTAs (no address form).

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1: background image; row 2: heading, optional paragraph, one or more CTA links (grouped into .hero-photo-actions).

## Supported variations

- default: centered copy (max 416px) on the photo with a 25% black overlay (source `data-overlay="dark"`).
- `left` ("Hero Photo (left)"): desktop copy in the left half (max 568px) over a dark left-to-right gradient (source `data-overlay="dark-gradient"`, e.g. "How satellite internet works"); mobile falls back to the centered default.

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Mid-page photo banners on home, plans, easycare.

## Reuse guidance

Author as "Hero Photo". A "Check availability" link here stays a button; use hero-lookup for an address field.
