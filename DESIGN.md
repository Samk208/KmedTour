# KmedTour Design System

**Last Updated:** April 18, 2026  
**Version:** 1.0  
**Maintainer:** KmedTour Design & Engineering Team

---

## Brand Philosophy

KmedTour connects African patients with world-class Korean medical facilities. Our design reflects trust, clarity, and patient empowerment—removing complexity from medical tourism without losing professionalism.

### Design Principles

1. **Patient-Centric** — Language and UI designed for patients, not engineers
2. **Trust-Focused** — Visual credibility signals (accreditation badges, real photos, transparent pricing)
3. **Accessible** — Inclusive design for all patients, across devices and languages
4. **Purposeful** — Every element serves patient journey (no decorative noise)
5. **Consistent** — Repeatable patterns across 444+ pages

---

## Color Palette

### Primary Colors

| Color | Hex | Usage | WCAG AA Contrast |
|-------|-----|-------|------------------|
| **KmedTour Blue** | `#0066CC` | Primary CTAs, headers, key elements | ✅ 8.2:1 on white |
| **KmedTour Navy** | `#001a66` | Body text, depth, emphasis | ✅ 14.5:1 on white |
| **KmedTour Teal** | `#00AA99` | Highlights, badges, accents | ✅ 5.1:1 on white |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Success Green** | `#10B981` | Confirmations, approved status |
| **Warning Amber** | `#F59E0B` | Alerts, important notices |
| **Error Red** | `#EF4444` | Errors, destructive actions |
| **Info Blue** | `#3B82F6` | Informational messages |

### Neutral Scale

| Name | Hex | Usage |
|------|-----|-------|
| **Cloud White** | `#F9F9F9` | Page backgrounds, section dividers |
| **Soft Grey** | `#F3F3F3` | Card backgrounds, form backgrounds |
| **Light Grey** | `#E5E5E5` | Borders, inactive states |
| **Border Grey** | `#D4D4D4` | Subtle divisions |
| **Deep Grey** | `#666666` | Secondary text |
| **Dark Grey** | `#1F1F1F` | Primary text (alternate to navy) |
| **Pure Black** | `#000000` | Maximum contrast (rare) |

### Dark Mode (Planned for Future)

When dark mode support is added, these mappings should be used:

```css
@media (prefers-color-scheme: dark) {
  --cloud-white: #0a0e27;
  --soft-grey: #1a1f3a;
  --deep-grey: #b0b0b0;
  --kmed-blue: #4da6ff; /* Lightened for dark backgrounds */
}
```

---

## Typography

### Font Families

```css
/* Headings */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Body Text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code / Monospace (internal only, not shown to patients) */
font-family: 'Monospace', monospace;
```

**Rationale:** Inter is modern, highly legible, and supports all languages (English, Korean, French, Arabic).

### Type Scale

| Role | Size | Weight | Line Height | Letter Spacing |
|------|------|--------|-------------|----------------|
| **H1** | 48px / 3rem | 700 Bold | 1.2 | -0.02em |
| **H2** | 36px / 2.25rem | 700 Bold | 1.25 | -0.01em |
| **H3** | 28px / 1.75rem | 700 Bold | 1.3 | 0em |
| **H4** | 24px / 1.5rem | 600 SemiBold | 1.35 | 0em |
| **H5** | 20px / 1.25rem | 600 SemiBold | 1.4 | 0em |
| **Body (Large)** | 18px / 1.125rem | 400 Regular | 1.6 | 0em |
| **Body** | 16px / 1rem | 400 Regular | 1.6 | 0em |
| **Body (Small)** | 14px / 0.875rem | 400 Regular | 1.5 | 0em |
| **Caption** | 12px / 0.75rem | 500 Medium | 1.4 | 0.5px |
| **Label** | 13px / 0.8125rem | 600 SemiBold | 1.4 | 0.2px |

### Usage Examples

```html
<!-- Page title -->
<h1 class="text-4xl md:text-5xl lg:text-6xl font-bold">
  World-Class Medical Care in Korea, Made Simple
</h1>

<!-- Section heading -->
<h2 class="text-3xl md:text-4xl font-bold">Your Journey</h2>

<!-- Subsection -->
<h3 class="text-2xl md:text-3xl font-bold">Share Your Needs</h3>

<!-- Regular body text -->
<p class="text-base leading-relaxed">We connect you with Korea's top hospitals...</p>

<!-- Small text (form hints, captions) -->
<span class="text-sm text-deep-grey">This information helps us find your perfect match</span>
```

---

## Spacing & Layout

### Base Unit

```css
/* All spacing is a multiple of 4px (base unit) */
--spacing-xs: 4px;   /* 1 unit )
--spacing-sm: 8px;   /* 2 units */
--spacing-md: 16px;  /* 4 units */
--spacing-lg: 24px;  /* 6 units */
--spacing-xl: 32px;  /* 8 units */
--spacing-2xl: 48px; /* 12 units */
--spacing-3xl: 64px; /* 16 units */
```

### Container & Breakpoints

```css
/* Container max-widths */
--container-sm: 640px;   /* Mobile */
--container-md: 768px;   /* Tablet */
--container-lg: 1024px;  /* Desktop */
--container-xl: 1240px;  /* Wide desktop (site standard) */

/* Responsive breakpoints (Tailwind convention) */
sm: 640px;   /* Mobile landscape, tablet portrait */
md: 768px;   /* Tablet */
lg: 1024px;  /* Desktop */
xl: 1280px;  /* Wide desktop */
2xl: 1536px; /* Ultra-wide */
```

### Grid System

```css
/* Column grid for layouts */
--grid-gutter: 24px; /* Space between columns */
--grid-columns: 12;  /* 12-column grid */
```

### Spacing in Context

```
Page
  ├─ Top padding: 48px (3xl)
  │
  ├─ Section
  │  ├─ Left/right padding: 16px (md) mobile, 24px (lg) desktop
  │  ├─ Bottom margin: 64px (3xl) before next section
  │  │
  │  └─ Card
  │     ├─ Padding: 24px (lg)
  │     ├─ Gap between items: 16px (md)
  │     └─ Border radius: 12px
  │
  └─ Bottom padding: 48px (3xl)
```

---

## Component Library

### Buttons

#### Primary Button
```tsx
<Button className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
  Get a Free Quote
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>
```

- **Background:** KmedTour Blue (`#0066CC`)
- **Hover:** Blue at 90% opacity
- **Text:** White
- **Padding:** 16px (md) horizontal, 12px vertical
- **Border Radius:** 8px
- **Min Touch Target:** 44px height

#### Secondary Button
```tsx
<Button variant="outline" className="border-2" style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}>
  How It Works
</Button>
```

- **Border:** 2px KmedTour Blue
- **Background:** Transparent or white/light
- **Hover:** Subtle background tint

#### Ghost Button
```tsx
<Button variant="ghost">
  Learn More →
</Button>
```

- **No border, no background by default**
- **Hover:** Subtle underline or color shift
- **Use:** For secondary links and low-emphasis actions

#### Disabled State (All Buttons)
```css
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

### Form Elements

#### Text Input
```tsx
<input
  className="w-full px-4 py-2 border border-[var(--border-grey)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--kmed-blue)] focus:ring-offset-2"
  type="text"
  placeholder="Full name"
/>
```

- **Border:** 1px light grey
- **Padding:** 12px horizontal, 8px vertical
- **Border Radius:** 8px
- **Focus State:** 2px blue ring with 2px offset

#### Select Dropdown
```tsx
<select className="w-full px-4 py-2 border border-[var(--border-grey)] rounded-lg">
  <option>Select country...</option>
</select>
```

Same styling as text input. Use Radix UI for better customization.

#### Checkbox
```tsx
<input
  type="checkbox"
  className="h-5 w-5 rounded border-gray-300 text-[var(--kmed-blue)] focus:ring-[var(--kmed-blue)]"
/>
```

- **Size:** 20px × 20px
- **Color:** KmedTour Blue when checked
- **Label:** Positioned to the right, 12px gap

#### Radio Button
Similar to checkbox, but circular.

### Cards

#### Standard Card
```tsx
<div className="bg-white rounded-lg border border-[var(--border-grey)] p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

- **Background:** White
- **Border:** 1px light grey
- **Padding:** 24px (lg)
- **Border Radius:** 8px
- **Shadow:** Subtle (box-shadow: 0 1px 3px rgba(0,0,0,0.1))
- **Hover Shadow:** Slightly larger shadow for interactivity

#### Highlighted Card (For features, testimonials)
```tsx
<div className="bg-[var(--soft-grey)] rounded-lg p-6 border-l-4" style={{ borderLeftColor: 'var(--kmed-teal)' }}>
  {/* Content */}
</div>
```

- **Background:** Soft grey
- **Left border:** 4px KmedTour Teal
- **No outer border needed**

### Typography Components

#### Hero Headline
```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance tracking-tight" style={{ color: 'var(--kmed-navy)' }}>
  Your Headline Here
</h1>
```

- **Color:** Navy
- **Line Height:** 1.2 (tight)
- **Letter Spacing:** -0.02em
- **Responsive:** Scales with viewport

#### Section Headline
```tsx
<h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
  Section Title
</h2>
```

#### Body Text
```tsx
<p className="text-lg md:text-xl leading-relaxed max-w-2xl" style={{ color: 'var(--deep-grey)' }}>
  Detailed explanation here...
</p>
```

- **Color:** Deep grey
- **Line Height:** 1.6 (comfortable reading)
- **Max Width:** 65 characters (readability best practice)

### Badges & Labels

#### Accreditation Badge
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--soft-grey)]">
  <CheckCircle className="h-4 w-4" style={{ color: 'var(--kmed-teal)' }} />
  <span className="text-sm font-semibold">KAHF Accredited</span>
</div>
```

- **Background:** Soft grey
- **Icon color:** Teal (trust signal)
- **Font:** Small (12px), semibold

#### Status Badge
```tsx
/* Success */
<span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
  Verified
</span>

/* Warning */
<span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
  Pending
</span>

/* Error */
<span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
  Unavailable
</span>
```

### Modals & Dialogs

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-xl">
    <h2 className="text-2xl font-bold mb-4">Title</h2>
    <p className="text-base mb-6">Message</p>
    <div className="flex gap-3">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </div>
</div>
```

- **Overlay:** Black at 50% opacity
- **Dialog:** Centered, max-width 448px (md)
- **Padding:** 32px (2xl)
- **Border Radius:** 8px
- **Close:** Escape key or click outside

### Loading & Empty States

#### Skeleton Screen (Preferred over spinner)
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

#### Success Message
```tsx
<div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
  ✓ Your submission was successful!
</div>
```

#### Error Message
```tsx
<div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
  ✗ Something went wrong. Please try again.
</div>
```

---

## Interactions & Animations

### Hover States

```css
/* Buttons */
button:hover {
  background-color: opacity 0.9;
  transform: scale(1.01);
  transition: all 200ms ease-out;
}

/* Cards */
div.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  transition: all 200ms ease-out;
}

/* Links */
a:hover {
  text-decoration: underline;
  color: var(--kmed-blue);
  transition: all 150ms ease-out;
}
```

### Focus States (Keyboard Accessibility)

```css
/* All interactive elements must have visible focus indicator */
button:focus,
input:focus,
a:focus {
  outline: 2px solid var(--kmed-blue);
  outline-offset: 2px;
}
```

### Transitions

```css
/* Durations */
--duration-fast: 150ms;    /* UI feedback, micro-interactions */
--duration-normal: 200ms;  /* Standard transitions */
--duration-slow: 300ms;    /* Entrance animations */

/* Easing */
--easing-out: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Fast out, slow in */
--easing-in: cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Slow out, fast in */
```

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### WCAG AA Compliance Checklist

- ✅ **Contrast Ratios:** All text meets 4.5:1 ratio (AAA for body, AA for large text)
- ✅ **Focus Indicators:** 2px blue outline with 2px offset
- ✅ **Keyboard Navigation:** All interactive elements reachable via Tab
- ✅ **Touch Targets:** Minimum 44px × 44px (44px × 24px acceptable for inline)
- ✅ **Form Labels:** All inputs have associated labels (`<label for="input-id">`)
- ✅ **Alt Text:** All images have descriptive alt text
- ✅ **ARIA Labels:** Complex components have ARIA labels (role, aria-label)
- ✅ **Heading Hierarchy:** H1 → H2 → H3 (no skipped levels)
- ✅ **Color Not Alone:** Icons and borders used in addition to color for status
- ✅ **Reduced Motion:** Respects `prefers-reduced-motion` media query

### Screen Reader Testing

- Test with: NVDA (Windows), JAWS, VoiceOver (Mac/iOS)
- Key flows to test:
  - Homepage navigation
  - Intake form completion
  - Hospital/procedure page browsing
  - Error message handling

---

## Reference & Inspiration

### Competitors & Industry Leaders

1. **Tufts Medical International** — Clean, professional, trust-focused
2. **Johns Hopkins International** — Prestigious design, clear CTAs
3. **Mayo Clinic** — Simple navigation, expert-driven
4. **Thailand Medical Tourism Board** — Competitive, modern design

### Design Tools & Tokens

- **Figma:** [KmedTour Design System file](https://figma.com/file/...) (internal link)
- **Tailwind CSS:** Primary design tool (see `tailwind.config.ts`)
- **Color Generator:** https://www.colorhexa.com/ (for variations)
- **Accessibility Checker:** https://webaim.org/contrast/check

---

## Implementation Checklist

Before shipping any new feature:

- [ ] Component follows this design system
- [ ] Contrast ratios verified (use WebAIM checker)
- [ ] Focus states visible (tab through with keyboard)
- [ ] Mobile responsive (test at 375px, 768px, 1240px)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Form inputs have labels and error handling
- [ ] Loading states implemented (skeleton screens)
- [ ] Error messages are clear and actionable
- [ ] Multi-language text fits without breaking layout
- [ ] Tested with screen reader (at least one)

---

## Questions?

For design system updates or clarifications:

1. Check this document first
2. Review Figma file (internal)
3. Ask the product design team in #design Slack channel
4. Create an issue in GitHub for major changes

---

**Last Updated:** April 18, 2026  
**Next Review:** May 15, 2026
