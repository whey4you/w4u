---
name: ui-ux-design
description: >-
  Expert guidelines and design system standards for crafting premium, modern, and accessible UI/UX interfaces.
  Use this skill whenever designing or styling components, landing pages, dashboards, responsive layouts,
  color palettes, micro-animations, typography, and interactive UI elements.
---

# UI/UX Design & Frontend Aesthetics Engineering Skill

This skill guides the AI to design state-of-the-art, visually stunning ("WOW" effect) user interfaces that feel polished, modern, and production-grade.

---

## 1. Visual Hierarchy & Design Tokens

Avoid raw, basic browser defaults. Always establish a cohesive design system using tokens:

### A. Modern Color Palettes (Dark/Light Slate & Tailored Accents)
- **Never use pure raw colors**: Avoid pure black (`#000000`) or harsh primaries (`#ff0000`, `#0000ff`).
- **Use Sophisticated Neutrals**:
  - Dark mode surfaces: Zinc / Slate (`#09090b`, `#18181b`, `#27272a`) with subtle 1px borders (`border-white/10` or `border-zinc-800`).
  - Light mode surfaces: Cool gray / off-white (`#f8fafc`, `#f1f5f9`, `#ffffff`) with crisp borders (`border-slate-200`).
- **Accent & Intent Colors**: Single primary brand accent (e.g. Electric Indigo, Vibrant Emerald, Radiant Orange) paired with subtle background glow/tint.

### B. Typography Hierarchy
- Use modern variable web fonts: **Plus Jakarta Sans**, **Inter**, or **Outfit**.
- Establish a clear type scale:
  - Hero Display: `text-4xl md:text-6xl font-extrabold tracking-tight`
  - Section Headings: `text-2xl md:text-3xl font-bold tracking-tight`
  - Body: `text-sm md:text-base text-muted-foreground leading-relaxed`
  - Badges / Small Meta: `text-xs font-semibold uppercase tracking-wider`

---

## 2. Depth, Glassmorphism & Modern Textures

- **Layered Surfaces**: Separate cards from backgrounds using layered elevations rather than heavy black drop shadows.
- **Glassmorphism**: Combine backdrop blur with semi-transparent background and border:
  ```css
  background: rgba(255, 255, 255, 0.05); /* or rgba(15, 23, 42, 0.75) */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```
- **Subtle Gradient Accents**: Use smooth radial gradients or mesh glows in container backgrounds to add life without distracting from content.

---

## 3. Micro-Interactions & Motion Discipline

Static UIs feel cheap. Dynamic, responsive micro-interactions make interfaces feel responsive and alive:

- **Button States**:
  - Hover: Subtle brightness lift or background tint transition (`transition-all duration-200 ease-out`).
  - Active / Click: Slight compression (`active:scale-[0.98]`).
  - Focus: Clear accessibility focus rings (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- **Cards & Items**:
  - Subtle `hover:-translate-y-1` or `hover:border-primary/50` with smooth transition.
- **Loading States**:
  - Always use **Skeleton Loaders** matching the exact shape of incoming content.
  - Never leave a blank screen or a single spinning circle for whole page sections.

---

## 4. Layout & Mobile-First Responsiveness

- **Touch Target Minimum**: All interactive elements (buttons, nav items, icons) must have a clickable area of at least **44x44px** on mobile.
- **Responsive Navigation**:
  - Desktop: Clean horizontal bar with sticky blur header (`backdrop-blur-md sticky top-0 z-50`).
  - Mobile: Smooth sliding sheet/drawer navigation or bottom navigation bar.
- **Form Controls**:
  - Inputs must have clear labels, descriptive placeholder text, helper text, and distinct error states with helpful guidance.
- **Spacing Grid**: Follow an 8px base rhythm (padding/margin: 8px, 16px, 24px, 32px, 48px).

---

## 5. Anti-Ugly Checklist (Never Do This)

- ❌ Never use raw browser buttons with default gray borders.
- ❌ Never cram content against edges; keep generous padding and whitespace.
- ❌ Never use low-contrast gray text on gray backgrounds (ensure WCAG AA minimum 4.5:1 ratio).
- ❌ Never allow horizontal scroll overflow on mobile screens (`overflow-x-hidden` on wrappers).
