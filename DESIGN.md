---
name: Matrix Intertrade
description: B2B AV/IT Solutions Provider
colors:
  primary: "oklch(0.205 0.075 258)"
  secondary: "oklch(0.972 0.01 250)"
  accent: "oklch(0.6 0.2 248)"
  cyan: "oklch(0.78 0.14 210)"
  navy: "oklch(0.205 0.075 258)"
  destructive: "oklch(0.6 0.22 27)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.16 0.04 250)"
typography:
  display:
    fontFamily: '"Schibsted Grotesk", "Anuphan", sans-serif'
    fontWeight: 800
  body:
    fontFamily: '"Schibsted Grotesk", "Anuphan", sans-serif'
    fontWeight: 400
rounded:
  sm: "calc(0.875rem - 4px)"
  md: "calc(0.875rem - 2px)"
  lg: "0.875rem"
  xl: "calc(0.875rem + 4px)"
  2xl: "calc(0.875rem + 8px)"
  3xl: "calc(0.875rem + 12px)"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.5rem"
---

# Design System: Matrix Intertrade

## 1. Overview

**Creative North Star: "The Professional Vanguard"**

The Professional Vanguard is a design system that embodies B2B reliability, forward-looking technology, and corporate trust. It relies on a strong "Corporate Navy" base paired with "Digital Cyan" to project both stability and innovation. The layouts prioritize clarity over density, ensuring that users are never overwhelmed by information.

This system explicitly rejects the "cluttered retail e-commerce" look. Every element must earn its place, and space is treated as a feature, not emptiness.

**Key Characteristics:**

- Tactical and confident structures
- Clear information hierarchy
- Layered and lifted components
- Strong, legible typography

## 2. Colors

Corporate Navy provides the steady foundation, while Digital Cyan and Electric Violet highlight interactive and innovative moments.

### Primary

- **Corporate Navy** (oklch(0.205 0.075 258)): The anchor of the brand. Used for dark backgrounds, heavy emphasis, and primary actions.

### Secondary

- **Digital Cyan** (oklch(0.78 0.14 210)): Used for glowing accents, secondary buttons, and active states.

### Tertiary

- **Electric Violet** (oklch(0.6 0.2 248)): Used for gradients, focus rings, and subtle technological accents.

### Neutral

- **Foreground Ink** (oklch(0.16 0.04 250)): Deep, cool-toned ink used for primary body text.
- **Background Paper** (oklch(1 0 0)): Pure white for the default canvas, ensuring maximum contrast and a clean corporate feel.

### Named Rules

**The Professional Restraint Rule.** Bright accents (Cyan/Violet) should never dominate the screen. They are reserved for interactive elements, highlights, and gradients, taking up no more than 10-15% of the visual space to maintain a corporate feel.

## 3. Typography

**Display Font:** "Schibsted Grotesk", "Anuphan", sans-serif
**Body Font:** "Schibsted Grotesk", "Anuphan", sans-serif

**Character:** A highly legible, modern, and sturdy sans-serif pairing that works flawlessly across English and Thai, projecting international corporate standards.

### Hierarchy

- **Display** (800, clamp(2.5rem, 5vw, 4.5rem), 1.1): Hero headlines. Commands attention with weight.
- **Headline** (700, 2rem, 1.2): Section titles.
- **Title** (600, 1.25rem, 1.3): Card titles and component headers.
- **Body** (400, 1rem, 1.6): Paragraph text. Capped at 75ch for optimal reading.
- **Label** (600, 0.875rem, 0.05em, uppercase): Button text and tags.

### Named Rules

**The Structural Legibility Rule.** Never use light weights (below 400) for body text. B2B clients need to read specs clearly without squinting.

## 4. Elevation

Layered & Lifted. The system uses strategic shadows to create a clear z-axis hierarchy, separating interactive components from the background canvas.

### Shadow Vocabulary

- **Card Shadow** (`0 1px 2px oklch(0.205 0.075 258 / 0.04), 0 4px 12px -4px oklch(0.205 0.075 258 / 0.08)`): Used for static cards to lift them gently off the background.
- **Elevation Shadow** (`0 2px 4px oklch(0.205 0.075 258 / 0.04), 0 24px 48px -16px oklch(0.205 0.075 258 / 0.24)`): Used for modals, dropdowns, and active hovered states.
- **Glow Shadow** (`0 8px 32px -8px oklch(0.78 0.14 210 / 0.5)`): Used for primary call-to-action elements to create a digital halo effect.

### Named Rules

**The Intentional Lift Rule.** Shadows are structural, not decorative. Use them to indicate that an element is interactive (buttons, cards) or overlays content (modals, navs).

## 5. Components

Tactile and Confident. Components have a substantial feel, clear borders, and defined interactive states.

### Buttons

- **Shape:** Gently curved edges (0.875rem radius).
- **Primary:** Corporate Navy background with white text, generously padded (12px 24px).
- **Hover / Focus:** Lifts with an elevation shadow and a subtle brightness increase.

### Cards / Containers

- **Corner Style:** Rounded (0.875rem) to Extra Large Rounded for hero cards.
- **Background:** White or very light gray.
- **Shadow Strategy:** Card Shadow at rest, Elevation Shadow on hover (see Elevation).
- **Border:** 1px solid subtle cool-gray border.
- **Internal Padding:** Generous padding (1.5rem to 2rem).

### Inputs / Fields

- **Style:** 1px border, white background, rounded edges (0.875rem).
- **Focus:** Sharp electric violet ring outline.

## 6. Do's and Don'ts

### Do:

- **Do** use generous whitespace (spacing-12 or more) between major sections.
- **Do** ensure all body text meets a minimum 4.5:1 contrast ratio against its background.
- **Do** use high-quality imagery of products and projects to "Show, Don't Tell".

### Don't:

- **Don't** clutter the screen with excessive information or dense walls of text.
- **Don't** use decorative side-stripe borders (e.g., `border-left: 4px solid blue`).
- **Don't** use neon or bright colors for large background areas.
- **Don't** use overly rounded corners (full pill shapes) for structural cards, as it breaks the professional B2B feel.
