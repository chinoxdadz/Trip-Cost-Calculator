---
applyTo: "**/*.{html,css,js,jsx,tsx}"
description: "Use consistent design tokens and responsive UI patterns for Trip Calculator pages and React variants."
---

# Trip Calculator UI Consistency

Use these tokens and patterns for all calculator screens.

## Design Tokens

```json
{
  "colors": {
    "primary": "#0C7A69",
    "secondary": "#F1F4F8",
    "accent": "#D14343",
    "background": "#F4F6F8",
    "surface": "#FFFFFF",
    "text": "#182230",
    "mutedText": "#5F6C7A",
    "border": "#D7DDE5",
    "successSurface": "#E7F6F3"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "12px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px"
  },
  "typography": {
    "fontFamily": "\"Segoe UI\", \"Helvetica Neue\", sans-serif",
    "title": "1.25rem",
    "subtitle": "0.92rem",
    "body": "1rem",
    "caption": "0.82rem"
  },
  "radius": {
    "sm": "10px",
    "md": "12px",
    "lg": "16px",
    "xl": "20px"
  },
  "shadow": {
    "card": "0 14px 30px -20px rgba(24,34,48,0.45)",
    "focus": "0 0 0 3px rgba(12,122,105,0.15)"
  },
  "breakpoints": {
    "mobile": "0px",
    "tablet": "760px",
    "smallMobile": "420px"
  }
}
```

## Styling Rules

- Use card layout for form and results sections.
- Keep touch targets at least 40px high.
- Use primary color for key CTA and totals.
- Use muted text color for helper labels and secondary text.
- Use consistent rounded corners from radius tokens.
- Maintain mobile-first layout and only expand to two columns on tablet and above.

## Component Rules

- Buttons: primary filled style with hover darken by 4 to 8 percent.
- Inputs/selects: white surface, 1px border, focus ring from focus shadow token.
- Summary total: highlighted panel with success surface and large numeric text.
- Alerts/warnings: use accent color for error text, avoid all-caps.

## Responsive Rules

- Under 420px: reduce card padding and large text sizes slightly.
- At 760px and above: use split layout, keep results panel sticky when appropriate.
- Prevent horizontal overflow on input groups and map containers.

## HTML/CSS Usage Example

```css
:root {
  --color-primary: #0C7A69;
  --color-bg: #F4F6F8;
  --radius-lg: 16px;
  --shadow-card: 0 14px 30px -20px rgba(24,34,48,0.45);
}
.card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
```

## React Usage Example

```jsx
export function Card({ children }) {
  return <section className="card">{children}</section>;
}
```

```css
.card {
  background: var(--color-surface, #fff);
  border: 1px solid #d7dde5;
  border-radius: 16px;
}
```
