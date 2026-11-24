# hero-lookup

Custom **hero** block. Purpose: Full-bleed photo hero with h1, subheading, address lookup form (from the "Check availability" link) and disclaimer.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1: background image; row 2: h1, subheading paragraph, link "Check availability" -> https://buy.viasat.com/en-US/r/ (becomes the address form), other CTA links (stay buttons), disclaimer paragraph(s) after the last form/button.

## Supported variations

| Variation | Option class |
| --- | --- |
| Left-aligned content | `left` |

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Page-top hero on home, plans, easycare. Only a link whose text is "Check availability" and that points at buy.viasat.com/en-US/r/ becomes the address form (shared scripts/address-lookup.js); every other link stays a button. Paragraphs after the last form/button get .hero-lookup-disclaimer. Use the "left" option for the left-column layout (easycare hero).

## Reuse guidance

Author the block name as "Hero Lookup" (class hero-lookup). "Hero (lookup)" would load the base hero with a "lookup" option instead.
