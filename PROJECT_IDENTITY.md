# PROJECT IDENTITY — CatfatIndia Shopify Theme

> **🔒 Locked. Do not modify without Shubh's approval.**
> Owner: Shubh Krishna / Bluewud Industries

---

## What This Project Is

A custom **Shopify theme** for CatFat India — an Indian e-commerce store selling premium lunch boxes and insulated bottles.

- Kid-friendly design, pink/coral/orange color palette
- Built from scratch (not a modified free theme)
- Deployed to: Shopify Admin → Themes → CatFat India theme

---

## Deployment Target

| Layer | Technology |
|---|---|
| Platform | Shopify (hosted) |
| Template language | Liquid |
| Frontend | HTML + CSS + Vanilla JavaScript (Web Components) |
| Deploy command | `shopify theme push` |
| CLI version | Shopify CLI v3.88.1 |
| Auth account | coredev2000@gmail.com |

**No build step needed.** Files deploy as-is to Shopify.

---

## Approved Tech Stack

| Component | Approved |
|---|---|
| Templates | Liquid (.liquid files) |
| JavaScript | Vanilla ES6+ Web Components |
| CSS | Custom properties, component stylesheets |
| Images | Shopify CDN (via theme editor, not repo) |

**NOT allowed:** React, Vue, npm packages, build tools.

---

## Color Palette (DO NOT CHANGE without approval)

| Color | Hex | Usage |
|---|---|---|
| Primary Pink | `#ff6b9d` | Buttons, accents, highlights |
| Dark Pink | `#e84a7f` | Hover states |
| Orange | `#ff8e53` | Secondary accent |
| Yellow | `#ffd93d` | Badges |
| Background | `#ffffff` / `#fff5f8` | Pages |

---

## Folder Structure

```
assets/         — CSS + JavaScript files
config/         — settings_schema.json + settings_data.json
layout/         — theme.liquid (main layout)
locales/        — en.default.json (translations)
sections/       — 16 page sections (header, footer, slideshow, etc.)
snippets/       — 45 reusable components (icons, price, product card, etc.)
templates/      — 9 JSON templates (homepage, product, collection, etc.)
```

---

## Key Business Details

| Item | Value |
|---|---|
| Store | CatFat India |
| WhatsApp | +918383013068 (floating button) |
| Support | support@catfatindia.com |
| Promo | "India's Biggest Lunch Sale — UPTO 80% OFF" |
| Free shipping | Above ₹499 |
| COD | Available |

---

## Untouchable Without Asking

- `config/settings_schema.json` — breaks theme editor if malformed
- `layout/theme.liquid` — main layout; wrong change breaks entire store
- Color palette (see above) — brand-defined
- WhatsApp phone number
- This file (`PROJECT_IDENTITY.md`)
