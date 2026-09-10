---
name: responsive-design
description: >-
  Expert workflows, architectural rules, and defensive CSS for responsive, adaptive, and fluid layouts across
  all screen sizes (compact mobile 320px, foldables, tablets, laptops, desktop, ultra-wide 4K) and browser zoom/scaling levels.
  Use when building layouts, handling multi-device responsiveness, fixing horizontal overflow, implementing fluid typography,
  or configuring container queries.
---

# Responsive & Adaptive UI Engineering Skill

This skill guarantees that user interfaces scale seamlessly, maintain visual balance, and never break across any screen dimension, aspect ratio, or browser zoom factor (100% to 200%).

---

## 1. Complete Device Breakpoint Scale

Design with a mobile-first philosophy, respecting the full spectrum of screen sizes:

| Token | Viewport Range | Target Devices | Design Rule |
| :--- | :--- | :--- | :--- |
| **`xs`** | `320px - 479px` | Compact phones (iPhone SE, Foldables cover screen) | Single column, tight paddings (`px-3` or `px-4`), minimal chrome |
| **`sm`** | `480px - 767px` | Modern smartphones (iPhone Pro Max, Galaxy Ultra) | Single column, standard touch targets (>= 44px) |
| **`md`** | `768px - 1023px` | Tablets (iPad portrait, large phablets) | 2-column grids, collapsible side navigation |
| **`lg`** | `1024px - 1279px`| Tablets landscape, small laptops (MacBook Air 13") | 3-column grids, persistent sidebars enabled |
| **`xl`** | `1280px - 1535px`| Standard desktop monitors & 15-16" laptops | Full navigation, 3-4 column layouts |
| **`2xl`+**| `>= 1536px` | Ultra-wide monitors, 2K & 4K displays | **Must cap container** (`max-w-7xl` or `max-w-[1600px] mx-auto`) |

> ⚠️ **Ultra-Wide Rule**: Never allow content containers to stretch infinitely across a 34" or 4K monitor. Always constrain page content within a centered container with generous horizontal margins.

---

## 2. Fluid Typography & Fluid Spacing (`clamp()`)

Avoid jarring font size jumps at discrete media query breakpoints. Use fluid formulas:

```css
/* Smoothly scales between mobile minimum and desktop maximum */
h1 {
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3.75rem);
  line-height: 1.1;
}

h2 {
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
}

.section-padding {
  padding-top: clamp(2.5rem, 5vw, 6rem);
  padding-bottom: clamp(2.5rem, 5vw, 6rem);
}
```

---

## 3. Container Queries (`@container`)

Media queries respond to the whole browser viewport; **Container queries** allow components to respond to the width of their immediate parent.

```css
/* Parent component defines the container context */
.card-wrapper {
  container-type: inline-size;
  container-name: product-card;
}

/* Card adapts whether placed in a narrow sidebar or a wide grid */
@container product-card (min-width: 420px) {
  .product-content {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
}
```

---

## 4. Zoom & Display Scaling Resilience (Windows 125% / 150%)

Many users run operating systems at 125% or 150% scaling. To prevent layout breakage:

1. **Use `rem` over fixed `px`**: Typography, margins, and padding must use `rem` so they respect user scaling and OS preferences.
2. **Never hardcode container heights**:
   - ❌ **BAD**: `height: 350px;` (text scales under zoom, overflows, and clips).
   - ✅ **GOOD**: `min-height: 350px; height: auto;`
3. **Use Dynamic Viewport Units on Mobile**:
   - Use `100dvh` (Dynamic Viewport Height) or `min-h-dvh` instead of `100vh` to prevent mobile browser URL address bars from covering buttons or causing layout jumps.

---

## 5. Defensive CSS: Zero-Overflow Guarantee

Follow these ironclad rules to eliminate horizontal scrollbars and broken flex layouts:

1. **Flex Child Expansion Protection**:
   Always add `min-w-0` to flex children containing text or truncated content:
   ```html
   <div class="flex items-center">
     <div class="min-w-0 flex-1">
       <p class="truncate">Very long text that will not blow out the flexbox container</p>
     </div>
   </div>
   ```
2. **Responsive Grids Without Media Queries**:
   ```css
   /* Automatically fits as many 280px columns as possible, down to 100% on small screens */
   grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
   ```
3. **Responsive Images & Media**:
   - All media elements must have `max-width: 100%; height: auto; display: block;`.
4. **Table & Code Block Scrolling**:
   - Never allow tables or code blocks to widen the whole page. Wrap them in a container with `overflow-x-auto`.

---

## 6. Verification Checklist
- [ ] Tested at **320px** (no horizontal scrollbar, readable text, touch targets >= 44px).
- [ ] Tested at **768px** (tablet layout clean, navigation switches gracefully).
- [ ] Tested at **1920px+** (content stays centered within max-width container).
- [ ] Tested at **150% browser zoom** (no text clipping or overlapping elements).
