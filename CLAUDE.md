# CLAUDE.md — CatfatIndia (Claude Code Extension)
# This file extends AGENTS.md with Claude Code-specific context.
# READ AGENTS.md FIRST — all architecture, rules, and project identity live there.

---

## Claude Code Notes

- **No build step**: Liquid files go straight to Shopify. No compile, no bundle. Edit → test → push.
- **Web Components in `assets/*.js`**: registered as custom HTML elements. Search for `customElements.define` to understand the component map.
- **Shopify CLI is the dev environment**: `shopify theme dev` opens a preview URL in your browser with hot reload.
- **JSON templates in `templates/`**: control which sections appear on each page type. If a new section doesn't appear, check the relevant template JSON.
- **Brand colors are variables**: find them in `assets/*.css` — look for `#ff6b9d`, `#ff8e53`, `#ffd93d`. Do not change these values.

## Useful Claude Code Commands for This Project

```bash
# Preview theme locally
shopify theme dev

# Push to dev theme (safe — doesn't affect live)
shopify theme push --development

# Check all sections
ls sections/

# Find all places a specific color is used
grep -r "#ff6b9d" assets/ sections/ snippets/ layout/

# Validate settings_schema.json before saving
python3 -c "import json; json.load(open('config/settings_schema.json')); print('JSON valid')"
```

## What to Read Before Touching Code

1. `AGENTS.md` — brand colors locked, WhatsApp number, all Shopify rules
2. `PROJECT_IDENTITY.md` — locked identity
3. `config/settings_schema.json` — theme editor settings (read-only context)
4. `layout/theme.liquid` — global layout (context only — do NOT modify)
