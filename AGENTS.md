# AGENTS.md — CatfatIndia
# Universal AI context file. Read this first, regardless of which AI tool you are.
# Works with: Claude Code, MiniMax, Antigravity, OpenClaw, Codex, Cursor, Copilot

---

## Project Identity

- **Name:** CatfatIndia
- **Owner:** Shubh (Bluewud)
- **Platform:** Shopify (custom Liquid theme, deployed via Shopify CLI)
- **Status:** Live / Production Storefront
- **Purpose:** Shopify storefront theme for CatFat India — lunch boxes and bottles for kids. Fun, colorful brand. Direct deployment to Shopify with no build step.

---

## Tech Stack

| Layer       | Tech                                           |
|-------------|------------------------------------------------|
| Templates   | Shopify Liquid (server-rendered)               |
| Components  | Web Components (custom HTML elements in `assets/*.js`) |
| Styling     | CSS in `assets/*.css`                          |
| Config      | `config/settings_schema.json` (theme editor)  |
| Deploy      | Shopify CLI (`shopify theme push`)             |

---

## Brand Identity — LOCKED

| Element          | Value                | Rule                      |
|------------------|----------------------|---------------------------|
| Primary color    | `#ff6b9d` (pink)     | Never change without Shubh |
| Secondary color  | `#ff8e53` (orange)   | Never change without Shubh |
| Accent color     | `#ffd93d` (yellow)   | Never change without Shubh |
| WhatsApp number  | `+918383013068`      | Never change               |

---

## Critical Rules — Any AI Must Follow

1. **Never touch `layout/theme.liquid`** without Shubh — one bad line = entire store down.
2. **Never touch `config/settings_schema.json`** without Shubh — invalid JSON = theme editor broken.
3. **Brand colors are locked** — do not change the hex values above.
4. **WhatsApp number is a business number** — do not change it anywhere in the theme.
5. **No build step** — Liquid files go directly to Shopify. There is no compile/bundle step.
6. **Always test with `shopify theme dev`** before `shopify theme push`.
7. **Never call `shopify theme push`** — Shubh deploys.

---

## File Structure (important files)

```
layout/
  theme.liquid            ← DO NOT TOUCH (entire store layout)
config/
  settings_schema.json    ← DO NOT TOUCH (theme editor schema)
  settings_data.json      ← OK to update (current setting values)
sections/
  *.liquid                ← OK to edit (drag-and-drop page sections)
snippets/
  *.liquid                ← OK to edit (reusable Liquid partials)
assets/
  *.css                   ← OK to edit (styles)
  *.js                    ← OK to edit (Web Components)
locales/
  en.default.json         ← OK to add/update translation keys
PROJECT_IDENTITY.md       ← Locked identity
```

---

## How Shopify Liquid Works (for AI context)

- **Sections** — draggable page blocks with `{% schema %}` for theme editor settings
- **Snippets** — reusable partials, used with `{% render 'snippet-name' %}`
- **Objects** — `product`, `collection`, `cart`, `customer` — Shopify-injected
- **Filters** — `| money`, `| asset_url`, `| img_url` — Shopify-specific

---

## Common Debug Patterns

| Symptom | Cause | Fix |
|---------|-------|-----|
| Theme editor broken | `settings_schema.json` invalid JSON | Validate JSON before saving |
| Section not appearing | Not in template JSON | Add to `templates/index.json` |
| JS not loading | Wrong filename in assets | Check `{{ 'file.js' | asset_url | script_tag }}` |
| CSS not applying | Not loaded in theme.liquid | Add `{{ 'file.css' | asset_url | stylesheet_tag }}` |

---

## Handoff Protocol

When done: summarize changes, list modified files, flag TODOs. Do not push to live.


## Session Start Checklist

Every session, before writing any code:
1. Read this AGENTS.md fully
2. Read TASKS.md — check what's IN PROGRESS (don't duplicate work)
3. Claim your task in TASKS.md before starting
4. Work on a branch: feat/[agent-tag]-T[id]-[slug]
5. Full protocol: BluewudOrchestrator/COORDINATION.md
