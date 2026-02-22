# CATFATINDIA Shopify Theme - Knowledge Document

## Project Overview

This is a custom-built Shopify theme for **CatFat India** - an Indian e-commerce store specializing in lunch boxes and bottles. The theme is built from scratch with full control over all code, designed to be clean, lightweight, and kid-friendly.

**Repository**: https://github.com/shubhkrishna19/catfat.git

---

## Theme Design

### Color Palette (Kid-Friendly)

| Variable | Color | Hex Code | Usage |
|----------|-------|----------|-------|
| `--color-primary` | Pink | `#ff6b9d` | Main brand color, buttons, accents |
| `--color-primary-dark` | Dark Pink | `#e84a7f` | Hover states, active elements |
| `--color-secondary` | Orange | `#ff8e53` | Secondary accents |
| `--color-accent` | Yellow | `#ffd93d` | Highlights, badges |
| `--color-text` | Dark Gray | `#333333` | Primary text |
| `--color-text-light` | Light Gray | `#666666` | Secondary text |
| `--color-background` | White | `#ffffff` | Page background |
| `--color-background-alt` | Light Pink | `#fff5f8` | Header, alternate sections |
| `--color-border` | Light Gray | `#f0f0f0` | Borders, dividers |

### Typography

- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif)
- **Heading Weight**: 700 (Bold)
- **Line Height**: 1.2 for headings, 1.6 for body

### Visual Effects

- **Border Radius**: 16px (cards), 8px (buttons), 24px (large elements)
- **Shadows**:
  - Small: `0 2px 8px rgba(0,0,0,0.08)`
  - Medium: `0 4px 16px rgba(0,0,0,0.12)`
  - Large: `0 8px 32px rgba(255, 107, 157, 0.2)`
- **Animations**: Smooth transitions with 0.3s ease

---

## Project Structure

```
CatFatIndia/
├── assets/              # CSS, JavaScript, Images
│   ├── base.css       # Main stylesheet
│   ├── base.js        # Base JavaScript
│   ├── constants.js   # Constants and events
│   ├── global.js      # Global functions
│   ├── pubsub.js     # Pub/Sub event system
│   └── ...           # Other assets
├── config/            # Configuration files
│   ├── settings_data.json    # Theme settings
│   └── settings_schema.json  # Settings schema
├── layout/            # Layout templates
│   └── theme.liquid  # Main theme template
├── locales/           # Translation files
│   └── en.default.json
├── sections/          # Theme sections
│   ├── header.liquid
│   ├── footer.liquid
│   ├── slideshow.liquid
│   ├── featured-collection.liquid
│   ├── announcement-bar.liquid
│   ├── rich-text.liquid
│   ├── multicolumn.liquid
│   ├── header-group.json
│   └── footer-group.json
├── snippets/          # Reusable code snippets
│   ├── meta-tags.liquid
│   ├── icon-cart.liquid
│   ├── icon-account.liquid
│   ├── icon-search.liquid
│   ├── icon-hamburger.liquid
│   ├── icon-close.liquid
│   ├── icon-caret.liquid
│   ├── icon-facebook.liquid
│   └── icon-instagram.liquid
└── templates/         # Page templates
    └── index.json     # Homepage template
```

---

## Key Variables Reference

### CSS Variables (in assets/base.css)

```css
:root {
  --color-primary: #ff6b9d;        /* Main pink brand color */
  --color-primary-dark: #e84a7f;   /* Darker pink for hover */
  --color-secondary: #ff8e53;      /* Orange accent */
  --color-accent: #ffd93d;         /* Yellow highlight */
  --color-text: #333333;           /* Primary text */
  --color-text-light: #666666;     /* Secondary text */
  --color-background: #ffffff;      /* White background */
  --color-background-alt: #fff5f8;  /* Light pink background */
  --color-border: #f0f0f0;        /* Border color */
  --font-family: ...;              /* Font family */
  --border-radius: 16px;           /* Card border radius */
  --border-radius-sm: 8px;         /* Small radius */
  --border-radius-lg: 24px;        /* Large radius */
  --shadow-sm: ...;                /* Small shadow */
  --shadow-md: ...;                /* Medium shadow */
  --shadow-lg: ...;                /* Large shadow */
  --transition: all 0.3s ease;     /* Transition timing */
}
```

### JavaScript Constants (in assets/constants.js)

```javascript
const PUB_SUB_EVENTS = {
  cartUpdate: 'cart-update',        // Triggered when cart is updated
  quantityUpdate: 'quantity-update', // Triggered on quantity change
  variantChange: 'variant-change', // Triggered on variant selection
  cartError: 'cart-error',         // Triggered on cart error
};
```

### Shopify Settings Variables (in config/settings_data.json)

| Variable | Type | Description |
|----------|------|-------------|
| `logo_width` | Number | Logo width in pixels (default: 140) |
| `colors_text` | RGB | Primary text color |
| `colors_background_1` | RGB | Primary background (white) |
| `colors_background_2` | RGB | Secondary background (light gray) |
| `colors_accent_1` | RGB | Primary accent (pink #ff6b9d) |
| `colors_accent_2` | RGB | Secondary accent (orange #ff8e53) |
| `page_width` | Number | Max page width in pixels (default: 1400) |

---

## Sections Documentation

### 1. Header (`sections/header.liquid`)

**Purpose**: Main navigation header with logo, menu, and icons

**Settings**:
- `menu`: Link list for navigation (default: "main-menu")
- `enable_customer_avatar`: Show/hide account icon

**Key Features**:
- Sticky header with white gradient background
- Mega menu support for dropdowns
- Mobile hamburger menu
- Search, Account, Cart icons
- Kid-friendly styling with pink accents

### 2. Footer (`sections/footer.liquid`)

**Purpose**: Site footer with links, newsletter, social icons

**Settings**:
- `show_language_selector`: Enable language selector

**Blocks**:
- `link_list`: Quick links menu
- `text`: Store information
- `newsletter`: Email signup form

### 3. Slideshow (`sections/slideshow.liquid`)

**Purpose**: Hero banner with auto-rotating slides

**Settings**:
- `auto_rotate`: Enable auto-rotation (default: true)
- `change_slides_speed`: Seconds between slides (default: 5)

**Blocks (Slide)**:
- `image`: Slide background image
- `heading`: Main heading
- `subheading`: Subtitle text
- `text`: Description text
- `button_label`: CTA button text
- `button_link`: CTA button link

### 4. Featured Collection (`sections/featured-collection.liquid`)

**Purpose**: Display products from a collection

**Settings**:
- `title`: Section heading
- `collection`: Collection to display
- `products_to_show`: Number of products (2-12)
- `columns_desktop`: Grid columns on desktop (1-5)

### 5. Announcement Bar (`sections/announcement-bar.liquid`)

**Purpose**: Top announcement banner

**Settings**:
- `text`: Announcement text
- `link`: Optional link

**Default Text**: "🎉 India's Biggest Lunch Sale - UPTO 80% OFF | Free Shipping Above ₹499 | COD Available"

### 6. Multicolumn (`sectionsmulticolumn.liquid`)

**Purpose**: Feature boxes/USP section

**Settings**:
- `title`: Section heading
- `columns_desktop`: Number of columns (1-4)

**Column Settings**:
- `column_1_title` through `column_4_title`: Column titles
- `column_1_text` through `column_4_text`: Column content

---

## How to Customize

### Adding New Sections

1. Create new file in `sections/` directory
2. Add schema with settings and blocks
3. Reference in template JSON files

Example schema structure:
```liquid
{% schema %}
{
  "name": "Section Name",
  "tag": "section",
  "class": "section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "default": "Default Title",
      "label": "Heading"
    }
  ],
  "presets": [{ "name": "Section Name" }]
}
{% endschema %}
```

### Modifying Colors

Edit CSS variables in `assets/base.css`:
```css
:root {
  --color-primary: #YOUR_COLOR;
  --color-secondary: #YOUR_COLOR;
}
```

### Adding New Icons

1. Create SVG file in `snippets/` as `icon-name.liquid`
2. Use in templates: `{% render 'icon-name' %}`

---

## Features Included

1. **Kid-Friendly Design**: Pink/coral/orange color scheme
2. **Responsive**: Works on mobile, tablet, desktop
3. **WhatsApp Button**: Floating WhatsApp button for customer support
4. **Announcement Bar**: Top bar with sale/important info
5. **Slideshow**: Auto-rotating hero banners
6. **Product Grid**: Featured collection with hover effects
7. **Newsletter Signup**: Email subscription form
8. **Trust Badges**: Free Shipping, COD, Quality, Support icons
9. **Mega Menu**: Dropdown navigation support
10. **Social Icons**: Facebook, Instagram links

---

## Supported Shopify Features

- Product display with prices
- Collection pages
- Cart functionality (drawer)
- Customer accounts
- Search functionality
- Multi-language support
- Newsletter signup

---

## Testing Checklist

When making changes, test:

- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] Product cards display properly
- [ ] Cart icon shows item count
- [ ] Slideshow auto-rotates
- [ ] Mobile responsive design
- [ ] WhatsApp button visible
- [ ] Footer links work

---

## Version History

- **v1.0.0** - Initial build with kid-friendly theme
  - Custom CSS with pink/coral colors
  - Essential sections: header, footer, slideshow, featured collection
  - Announcement bar with sale text
  - WhatsApp floating button
  - Multicolumn trust badges

---

*Last Updated: February 2026*
