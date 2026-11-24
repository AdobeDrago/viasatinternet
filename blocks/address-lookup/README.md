# address-lookup

Custom **address-lookup** block. Purpose: Address availability lookup: prompt text plus an address field that redirects to the authored destination.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1: prompt text (optional); row 2: link "Check availability" -> https://buy.viasat.com/en-US/r/ (href = destination, text = button label).

## Supported variations

| Variation | Option class |
| --- | --- |
| Open destination in the same window | `same-window` |
| Show unit / apartment field | `unit` |

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Shared CTA band fragment /viasatinternet/fragments/address-lookup. Submit logic lives in scripts/address-lookup.js (also used by hero-lookup): countryCode=US is added for buy.viasat.com, addressLine1 = address, addressLine2 = unit (if the unit option is on and filled); an empty address shows "Enter your address". Cross-host destinations open in a new tab (noopener) unless the "same-window" option or a link target is set. No autocomplete (the source /bin/autoCompleteAddress is not migrated).

## Reuse guidance

Author as "Address Lookup". Form CSS is shared in styles/address-lookup.css.
