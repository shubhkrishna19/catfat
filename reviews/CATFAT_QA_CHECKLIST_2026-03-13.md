# Catfat QA Checklist

## Storefront

- Homepage loads without Liquid errors
- Hero buttons go to correct collections
- Trust section renders correctly on desktop and mobile
- FAQ opens/closes cleanly
- Footer newsletter works and shows correct messages
- Header mobile navigation opens and closes correctly

## Collections

- `/collections/all-products` loads correctly
- product cards stay aligned across multiple rows
- pagination works
- sort dropdown works
- sale/non-sale cards both look balanced

## Product Pages

- test at least 10 real products with different option structures
- clicking product thumbnails changes the main image
- selecting a variant updates:
  - variant ID
  - price
  - compare-at price
  - savings text
  - current selection text
- sold-out combinations disable add-to-cart
- quantity selector works
- related products render correctly

## Cart / Conversion

- add-to-cart works from product pages
- one-variant products still add correctly from cards
- multi-variant products route correctly to PDP
- cart opens or loads correctly
- cart quantity updates work

## Catalog Audit

- featured image quality
- image order
- title quality
- handle quality
- option naming consistency
- compare-at price accuracy
- description quality
