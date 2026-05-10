# DESIGN.md - Ăn Vặt Híu Híu Homepage UI

## Design Philosophy

**Playful & Trustworthy Marketplace**: A modern, animated snack store that feels friendly and energetic. Every interaction should delight - from bouncing illustrations to items flying into the cart. Mobile experience is polished, performance is seamless.

---

## 🎨 Brand Identity

### Color Palette (OKLCH Color Space)

**Primary Colors:**

- **Mint Teal (Dark)**: `oklch(45% 0.18 165)` (#0A9B8E) - Main CTA, emphasis
- **Mint Teal (Light)**: `oklch(85% 0.06 165)` (#E8F9F7) - Background, subtle highlights
- **White**: `oklch(99% 0.002 200)` (#FFFBF8) - Clean backgrounds, cards

**Accent Colors (for depth & delight):**

- **Coral Gold**: `oklch(65% 0.15 35)` (#E8956F) - Badges, highlights, secondary CTAs
- **Soft Pink**: `oklch(75% 0.1 15)` (#F0D0C8) - Gentle alerts, promo badges
- **Forest Green**: `oklch(35% 0.12 150)` (#0D5F54) - Dark accents, text emphasis

**Neutral Colors:**

- **Text Dark**: `oklch(15% 0.01 200)` (#1F2937) - Body text, headings
- **Text Light**: `oklch(60% 0.01 200)` (#9CA3AF) - Captions, secondary text
- **Border**: `oklch(90% 0.01 200)` (#E5E7EB) - Dividers, card borders

### Typography System

**Font Family:**

- Primary: Roboto (system fallback: -apple-system, BlinkMacSystemFont, Segoe UI)
- Weights: Regular (400), Medium (500), Bold (600), Semibold (700)

**Type Scale:**

- **H1 (Hero Title)**: 32px / Bold 700 / Line 1.1 (mobile)
- **H2 (Section Title)**: 24px / Semibold 600 / Line 1.2
- **H3 (Product Name)**: 16px / Semibold 600 / Line 1.2
- **Body**: 14px / Regular 400 / Line 1.5 / Max 70ch
- **Small**: 12px / Medium 500 / Line 1.4
- **Caption**: 11px / Regular 400 / Line 1.3

**Hierarchy Notes:**

- Product names: **Bold 600**, 16px, color Mint Teal Dark
- Prices: **Bold 700**, 18px, color Coral Gold (stands out)
- Buttons: **Semibold 600**, 14px, all-caps optional
- Body copy: Regular 400, soft color

---

## 📐 Layout & Structure

### Overall Mobile Layout (320-767px)

```
┌─────────────────────┐
│ HEADER              │ (sticky)
│ Logo | Search | Cart│
├─────────────────────┤
│ HERO SECTION        │
│ (Floating snacks)   │
│ Title + Buttons     │
├─────────────────────┤
│ CATEGORY BAR        │
│ (horizontal scroll) │
├─────────────────────┤
│ PRODUCT GRID (2col) │
│ ┌─────┬─────┐       │
│ │Card │Card │       │
│ ├─────┼─────┤       │
│ │Card │Card │       │
│ └─────┴─────┘       │
└─────────────────────┘
```

### Desktop Layout (1024px+)

```
Same structure, but:
- Product Grid: 4 columns
- Hero section wider
- More spacious padding
```

### Spacing System (8px base unit)

- **xs**: 4px (0.5 unit)
- **sm**: 8px (1 unit)
- **md**: 16px (2 units)
- **lg**: 24px (3 units)
- **xl**: 32px (4 units)
- **2xl**: 48px (6 units)

---

## 🎯 Component Specifications

### 1. Header

**Height**: 56px (mobile), 64px (desktop)
**Sticky**: Yes, stays at top on scroll
**Background**: White with subtle shadow on scroll

**Contents (flex, space-between):**

- **Left**: Logo (40px height, maintain aspect ratio)
- **Center**: Search input (if desktop) or search icon (mobile)
- **Right**: Icons - favorites (heart), cart with badge

**Search Bar** (when visible):

- Placeholder: "Tìm món ngon..."
- Icon: Search icon left (mint teal)
- Border: 1px solid border color
- Padding: 10px 12px
- Border-radius: 20px

**Cart Icon**:

- Badge background: Coral Gold
- Badge text: Bold white, 10px font
- Shake animation when item lands

---

### 2. Hero Section

**Background**: White / Light mint
**Height**: 300px (mobile), 400px (desktop)
**Layout**: Flex column, centered

**Structure:**

```
┌────────────────────┐
│   Floating Items   │
│   (Snack vectors)  │
│                    │
│  "Ăn Vặt Híu Híu"  │
│  (Title - Bold)    │
│  "Đặt snack ngon   │
│   tay bạn"         │
│  (Tagline)         │
│                    │
│ [Tìm món ngon]     │
│ [Xem sản phẩm]     │
└────────────────────┘
```

**Animations:**

- **Floating Snacks**: Y-axis bounce, ~2-3 second loop (Framer Motion)
  - Delay offset for each item (+0.2s, +0.4s)
  - Amplitude: ±15px
  - Easing: easeInOut
- **Title**: Fade-in + slight scale on load (0.8 → 1.0)
- **Buttons**: Subtle hover scale (1.05)

**Title Styling:**

- "Ăn Vặt" in Mint Teal Dark (H1 / 32px Bold)
- "Híu Híu" in Coral Gold (same size)
- Or: All in Mint with "Híu Híu" underline in Coral

**Buttons:**

- Button 1 (Primary): Mint teal, full-width or 48% width
  - Text: "🔍 Tìm món ngon"
  - Height: 48px (touch-friendly)
  - Border-radius: 12px
- Button 2 (Secondary): Outline mint, full-width or 48% width
  - Text: "Xem sản phẩm"
  - Border: 2px solid Mint Teal Dark

---

### 3. Category Bar

**Height**: 56px
**Background**: White with scroll shadow
**Behavior**: Horizontal scroll (mobile), flex wrap (desktop)
**Padding**: 12px horizontal

**Category Pill:**

- **Inactive**:
  - Background: Light mint
  - Border: 1px solid border color
  - Padding: 10px 16px
  - Font: Medium 500, 13px
- **Active**:
  - Background: Mint Teal Dark
  - Text: White
  - Bold 600

**Scroll Behavior:**

- Smooth horizontal scroll on mobile
- First category pre-selected (e.g., "Tất cả")

---

### 4. Product Card

**Width**: 100% of column (2 cols mobile, 4 cols desktop)
**Aspect Ratio**: Flexible (image 1:1, then title + price below)

**Layout Structure:**

```
┌─────────────────┐
│    Product      │
│     Image       │ (1:1 aspect)
│  (1 line badge) │ (optional)
├─────────────────┤
│ Product Name    │ (2 lines max, bold)
├─────────────────┤
│ 45.000 ₫        │ (price highlight)
├─────────────────┤
│ + Thêm vào giỏ  │ (full-width button)
└─────────────────┘
```

**Image:**

- Aspect ratio: 1:1 (square)
- Object-fit: cover
- Border-radius: 8px (top)
- Lazy-load with blur placeholder

**Product Name:**

- Font: Semibold 600, 16px
- Color: Text Dark
- Overflow: Clamp to 2 lines with ellipsis
- Padding: 12px 12px 4px

**Price:**

- Font: Bold 700, 18px
- Color: Coral Gold (#E8956F)
- Padding: 4px 12px 12px
- Format: "45.000 ₫" (with space)

**"Thêm vào giỏ" Button:**

- Background: Mint Teal Dark
- Text: White, Semibold 600, 14px
- Height: 44px (minimum touch size)
- Border-radius: 6px
- Margin: 0 12px 12px
- Hover: Subtle scale (1.02), brightness increase

**Card Padding/Spacing:**

- No padding on card itself (bleed image to edge)
- Content padding: 12px bottom spacing

**Hover Effect (Desktop):**

- Scale: 1.03
- Shadow: 0 8px 16px rgba(10, 155, 142, 0.12)
- Transition: 200ms ease

---

### 5. Add to Cart Animation (Flying Item)

**Trigger**: User taps "Thêm vào giỏ" button

**Animation Flow:**

1. **Item Clones**:
   - Create visual copy of product image/icon
   - Start at button position (product card)
   - Destination: Cart icon in header

2. **Flying Path**:
   - Duration: 600ms
   - Easing: cubic-bezier(0.25, 0.46, 0.45, 0.94) (smooth deceleration)
   - Trajectory: Curved path (quadratic bezier)
   - Scale during flight: 1.0 → 0.8 (gets smaller)
   - Opacity: 1.0 → 0.7 (fades slightly)

3. **Cart Shake** (on landing):
   - Duration: 400ms
   - Shake intensity: ±8px horizontal
   - Easing: ease-in-out
   - Then bounce: 0.8 → 1.1 → 1.0

**Implementation (Framer Motion):**

```javascript
// Pseudo-code
const animateToCart = (startPos, cartPos) => {
  motion.div({
    initial: { x: startPos.x, y: startPos.y, scale: 1, opacity: 1 },
    animate: { x: cartPos.x, y: cartPos.y, scale: 0.8, opacity: 0.7 },
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  });
};
```

---

### 6. Product Grid Container

**Gap**: 12px (between cards)
**Padding**: 16px horizontal (mobile), 24px (desktop)
**Margin-top**: 24px (spacing from category bar)

**Responsive Columns:**

- Mobile (320-767px): 2 columns
- Tablet (768-1023px): 3 columns
- Desktop (1024px+): 4 columns

---

## 🎨 Visual Refinements

### Card Shadows

- Subtle: `0 1px 3px rgba(0, 0, 0, 0.08)`
- Hover: `0 8px 16px rgba(10, 155, 142, 0.12)`

### Border Radius

- Buttons: 12px
- Cards: 8px (top), 6px (bottom)
- Inputs: 20px

### Transitions

- All interactive elements: 200-300ms ease
- Animations: Use Framer Motion for smooth 60fps
- No lag on mobile: Prefer transform/opacity over layout properties

### Loading States

- **Skeleton screens**: Light mint pulse animation
- **Button loading**: Spinner or animated dots inside button
- **Image loading**: Blurhash placeholder → image

### Empty States / Error States

- Centered message with icon
- Color: Text Light
- Icon: Coral Gold accent

---

## 📱 Mobile Optimizations

### Touch Targets

- Minimum size: 44px × 44px
- Padding between targets: At least 8px

### Gestures

- **Swipe Category Bar**: Left/right to scroll
- **Tap Card**: Could navigate to detail (optional, UX already set)
- **Tap Button**: Add to cart with animation

### Performance

- Image lazy loading (Intersection Observer)
- Virtualized scrolling for large product lists (if 100+ items)
- Debounce search input (300ms)
- 60fps target for animations (use requestAnimationFrame)

---

## 🎯 Accessibility (WCAG 2.1 AA)

- **Color Contrast**: Text on background ≥ 4.5:1
  - Mint Teal on White: ✅ Pass
  - Coral Gold on White: ✅ Pass
- **Focus Indicators**: Visible 2px outline on all interactive elements
- **Semantic HTML**: `<button>`, `<nav>`, `<main>`, `<section>`
- **ARIA Labels**:
  - Cart button: `aria-label="Giỏ hàng, {count} sản phẩm"`
  - Add button: `aria-label="Thêm {productName} vào giỏ hàng"`
- **Keyboard Navigation**: Tab order logical, all controls accessible

---

## 📊 Performance Targets

| Metric                         | Target            |
| ------------------------------ | ----------------- |
| LCP (Largest Contentful Paint) | < 2.5s            |
| FID (First Input Delay)        | < 100ms           |
| CLS (Cumulative Layout Shift)  | < 0.1             |
| Animation FPS                  | 60fps             |
| Bundle Size                    | < 200KB (gzipped) |

**Optimization Strategies:**

- Next.js Image for optimization
- Code-split animations (Framer Motion lazy load)
- Minify CSS/JS
- Use WebP with JPEG fallback
- Compress images aggressively

---

## 🚀 Implementation Checklist

### Visual Design

- [ ] Color palette approved (Mint + Coral + White)
- [ ] Typography hierarchy tested on mobile/desktop
- [ ] All touch targets ≥ 44px
- [ ] Card shadows & hover states implemented
- [ ] Border radius consistent

### Animations

- [ ] Hero floating snacks smooth & on-brand
- [ ] Flying item to cart animation 60fps
- [ ] Cart shake/bounce feedback polished
- [ ] No lag on low-end mobile devices
- [ ] Animations respect `prefers-reduced-motion`

### Mobile Experience

- [ ] Responsive layout verified (2 → 4 cols)
- [ ] Images load quickly (lazy loading)
- [ ] Search/filters perform well
- [ ] Gestures smooth and responsive

### Accessibility

- [ ] WCAG 2.1 AA contrast verified
- [ ] Focus indicators visible
- [ ] Screen reader labels complete
- [ ] Keyboard navigation works

### Performance

- [ ] LCP < 2.5s (measured on 4G)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle size optimized
