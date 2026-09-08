---
name: Editorial Intelligence System
colors:
  surface: '#041423'
  surface-dim: '#041423'
  surface-bright: '#2b3b4b'
  surface-container-lowest: '#010f1e'
  surface-container-low: '#0c1d2c'
  surface-container: '#112130'
  surface-container-high: '#1c2b3b'
  surface-container-highest: '#273646'
  on-surface: '#d4e4f9'
  on-surface-variant: '#e2bec3'
  inverse-surface: '#d4e4f9'
  inverse-on-surface: '#223241'
  outline: '#a9898e'
  outline-variant: '#5a4045'
  surface-tint: '#ffb1c0'
  primary: '#ffb1c0'
  on-primary: '#660029'
  primary-container: '#ff4c83'
  on-primary-container: '#5a0023'
  inverse-primary: '#bb0452'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c0'
  on-primary-fixed: '#3f0017'
  on-primary-fixed-variant: '#90003d'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#041423'
  on-background: '#d4e4f9'
  surface-variant: '#273646'
typography:
  metric-hero:
    fontFamily: Geist
    fontSize: 3rem
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  metric-lg:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: '1.15'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: 0em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.08em
  code-tabular:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: -0.02em
spacing:
  grid-margin-desktop: 1.5rem
  grid-gutter-desktop: 1px
  grid-margin-mobile: 0.75rem
  grid-gutter-mobile: 1px
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

The design system establishes a high-performance analytical environment tailored for enterprise creator agencies, media holding groups, and quantitative social strategists. It discards consumer-grade SaaS conventions—such as playful illustrations, excessive padding, and ambient neon glows—in favor of structural rigor, density, and institutional authority akin to high-frequency trading terminals and specialized editorial publishing software.

### Aesthetic Direction
- **Precision Brutalism meets Financial Editorial:** Strict square-edge and ultra-low-radius architecture (0px to 2px max), razor-sharp 1px dividers, tabular typographic layouts, and information-dense matrix structures.
- **Tone:** Methodical, surgical, unyielding, and objective. Every pixel represents data or functional orientation.
- **Visual Weight:** Heavy reliance on high-contrast monospaced tabular metrics, structural grid lines, and crisp visual demarcations rather than elevation through drop shadows.
- **Accents:** Restrained use of the iconic social sunset magenta (`#E1306C`), treated not as a playful decorative element, but as an acute diagnostic needle for peak insights, viral inflection points, and active system signals.

## Colors

The system operates primarily in a calibrated dark mode to reduce eye strain during prolonged analysis of dense feeds and data tables, supported by a mirrored, high-contrast light mode for daytime export and executive print-ready reports.

### Dark Mode (Default)
- **App Canvas (`canvas-base`):** `#0A0D12` (Cold, deep black)
- **Primary Panel Layer (`surface-100`):** `#11161F` (Dark structural slate)
- **Elevated Analytical Surface (`surface-200`):** `#161D27` (Interactive active state & metric cards)
- **High-Order Layer (`surface-300`):** `#1E2633` (Dropouts, popovers, pinned column headers)
- **Structural Line / Hairline Border (`border-subtle`):** `#222C3A` (Crisp 1px boundary)
- **Strong Structural Border (`border-strong`):** `#324053` (Focus rings, active tabs, panel dividers)
- **Text Primary:** `#F0F4F8` (Off-white, 100% contrast, non-glare)
- **Text Secondary:** `#8B9BAE` (Muted technical slate for captions, metadata, and labels)
- **Text Tertiary / Disabled:** `#526071` (Inactive controls, empty cell indicators)

### Signal & Diagnostic Accents
- **Core Signal (Diagnostic / Inflection):** `#E1306C` (Instagram Analytical Magenta; used for peak outlier metrics, key creator tracking, and primary state markers)
- **Benchmark Above / Yield (`signal-positive`):** `#10B981` (Emerald)
- **Benchmark Below / Deficit (`signal-negative`):** `#EF4444` (Crimson Rose)
- **Attention / High Volatility (`signal-warning`):** `#F59E0B` (Amber)
- **Comparative Baseline (`signal-comparison`):** `#6366F1` (Indigo Slate; used for secondary cohorts, past period projections, and algorithmic baselines)

### Color Hierarchy Principles
Color must never be applied decoratively. Full-bleed colored buttons are restricted strictly to primary, destructive, or confirmed actionable states. Data visualizations must prioritize semantic performance indicators (`#10B981` / `#EF4444`) or comparative baselines (`#6366F1`) over brand accents.

## Typography

The typographical structure relies on Geist for compact, neutral structural reading, paired with JetBrains Mono for diagnostic clarity and tabular metric display.

### Numerical Integrity & Alignment
All statistical displays, data tables, metrics, percentages, and timestamps must leverage OpenType `tnum` (tabular figures) and `zero` (slashed zero) to guarantee vertical alignment across recurring rows and side-by-side analytical comparisons.

### Editorial Case Conventions
- **Section Headers & Metric Identifiers:** Rendered using `label-caps` in uppercase format with wide tracking (`0.08em`), evoking traditional newspaper analytical indices and financial tables (e.g., `MEDIAN IMPRESSION MULTIPLIER`, `RETENTION VELOCITY`).
- **Headings & Story Titles:** Rendered in sentence case without decorative italicization or excessive weight variations.

## Layout & Spacing

The layout is governed by an interlocking, border-defined modular grid. Surfaces do not float on top of a soft plane; rather, the workspace is carved into precise analytical panes separated by 1px rules (`#222C3A`).

### Grid Mechanics
- **Desktop (1280px and above):** 16-column analytical matrix with 0px or 1px gutter spacing, mimicking a physical workstation terminal. Panes share borders directly, eliminating dead background whitespace between cards.
- **Tablet (768px - 1279px):** 8-column layout with collapsing secondary contextual inspectors into slide-over panels.
- **Mobile (below 768px):** Single vertical stack with sticky data row headers. Metrics prioritize single-line data strips over multi-row widgets.

### Spacing Compactness
- Inner card padding is constrained to `space-md` (12px) or `space-base` (16px) to maximize data density above the fold.
- Strict 4px/8px incremental rhythm for element grouping. 
- Avoid generous breathing rooms; visual hierarchy is preserved through rigorous typographic scale and contrasting text tones, not void space.

## Elevation & Depth

This system intentionally rejects soft atmospheric shadows, drop blurs, and curved layered cards. Depth is simulated through surface luminance, hard linear borders, and explicit coordinate stacking.

### Flat Structured Stratification
1. **Base Foundation (`#0A0D12`):** Primary viewport backdrop, canvas frame, and baseline grid structure.
2. **Standard Surface (`#11161F`):** Default card background, table cells, and analytical modules.
3. **Interactive & Highlighted Cells (`#161D27`):** Row hover states, selected items, active control wells, and filtered column ranges.
4. **Modal Overlays & Pinned Navigations (`#1E2633`):** Contextual inspector panels and dropdown menus. These surfaces employ a crisp `1px solid #324053` border.

### Drop Shadows
Drop shadows are disallowed on standard content cards and data panels. Floating context menus, popovers, and absolute tooltips may employ a sharp, tight shadow purely to separate them from the dense text grid below:
- `box-shadow: 0 4px 0 0 rgba(0, 0, 0, 0.6), 0 0 0 1px #324053`

## Shapes

The design system enforces an unapologetic architectural geometry:
- **Default Geometry (0px):** Metric panels, dashboard modules, data tables, segmented control bars, input fields, navigation ribbons, and media preview frames are strictly rectangular (`border-radius: 0px`).
- **Targeted Softening (Max 2px):** Tooltip badges, micro inline tags, and state pills may selectively use `border-radius: 2px` solely to prevent optical cutting against text, but never round off into curves.
- **Zero Pill / No Bubbles:** Pill shapes (`rounded-full`, 9999px) are prohibited across all UI components, maintaining a serious, institutional apparatus aesthetic.

## Components

### Buttons & Trigger Controls
- **Primary Action:** Solid `#E1306C` background, `#FFFFFF` text, rectangular (0px radius), font: `JetBrains Mono` 11px uppercase bold, padding: `8px 16px`. Hover: `#C9245C`. Active: `#B01D4F`.
- **Secondary / Ghost:** Transparent background with `1px solid #222C3A`, `#F0F4F8` text. Hover: Background `#161D27`, border `#324053`.
- **Destructive:** Transparent background with `1px solid #EF4444`, text `#EF4444`. Hover: Background `#EF4444`, text `#FFFFFF`.

### Analytical Metrics & KPI Tiles
- **Structure:** 0px radius, bounded by `1px solid #222C3A`, surface `#11161F`.
- **Content Hierarchy:** Top row features `label-caps` in `#8B9BAE` with an optional benchmark delta badge (`#10B981` / `#EF4444`). Middle row contains large `metric-lg` or `metric-hero` numbers in `#F0F4F8` using tabular numbers. Bottom row contains a compact sparkline or baseline deviation index.

### Data Tables & Feed Inspection Grids
- **Header:** Sticky, `#0A0D12` background, `1px solid #222C3A` bottom border, typography `label-caps` in `#8B9BAE`.
- **Rows:** Height fixed at 36px (compact) or 48px (detailed). Row divider: `1px solid #161D27`. Hover state: background `#161D27`.
- **Numbers:** Rigorous right-alignment for all numerical quantities, views, engagement ratios, and monetary values.

### Chips, Filter Pills & Status Indicators
- **Filter Segment:** Sharp rectangular tabs, grouped seamlessly with shared 1px interior borders. Active tab uses `#1E2633` background with an off-white text and bottom active indicator (`2px solid #E1306C`).
- **Status Indicators:** Micro-square (4px × 4px) indicator light instead of round dots, colored by status (`#10B981`, `#EF4444`, `#F59E0B`).

### Form Inputs & Search Fields
- **Container:** `0px` radius, background `#0A0D12`, border `1px solid #222C3A`, padding `8px 12px`.
- **States:** Focus: `1px solid #6366F1`, no ambient blur or outer glow ring. Placeholder text `#526071`.

### Media Preview & Creative Inspector Cards
- **Aspect Ratio:** Fixed 1:1, 4:5, or 9:16 Instagram format containers, framed with a sharp `1px solid #222C3A` border.
- **Overlay:** High-contrast data overlay appearing on hover, presenting engagement velocity, save-to-reach index, and retention milestones directly on a darkened scrim (`#0A0D12` at 85% opacity).