---
name: Precision MD
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#373940'
  surface-container-lowest: '#0c0e14'
  surface-container-low: '#191b22'
  surface-container: '#1e1f26'
  surface-container-high: '#282a30'
  surface-container-highest: '#33343b'
  on-surface: '#e2e2eb'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e2e2eb'
  inverse-on-surface: '#2e3037'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c4c0ff'
  primary: '#c4c0ff'
  on-primary: '#2000a4'
  primary-container: '#8781ff'
  on-primary-container: '#1b0091'
  inverse-primary: '#4f44e2'
  secondary: '#c5c0ff'
  on-secondary: '#2500a2'
  secondary-container: '#3e26ca'
  on-secondary-container: '#b6b0ff'
  tertiary: '#ffb785'
  on-tertiary: '#502500'
  tertiary-container: '#db761f'
  on-tertiary-container: '#461f00'
  error: '#E44D26'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c0ff'
  on-primary-fixed: '#100069'
  on-primary-fixed-variant: '#3622ca'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c5c0ff'
  on-secondary-fixed: '#140067'
  on-secondary-fixed-variant: '#3b22c8'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb785'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#111319'
  on-background: '#e2e2eb'
  surface-variant: '#33343b'
  surface-dark: '#1E2130'
  surface-light: '#FFFFFF'
  bg-light: '#F8F9FC'
  success: '#009688'
  warning: '#FFB020'
  syntax-comment: '#425A70'
  syntax-keyword: '#A58EFB'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  ui-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  panel-gap: 1px
---

## Brand & Style
The design system is built for a professional developer utility, prioritizing functional clarity and visual focus. The aesthetic is a hybrid of high-end code editors and modern productivity tools—characterized by "VS Code meets Notion." 

The style is **Modern Minimalist with a focus on Tonal Layers**. It avoids unnecessary ornamentation, using subtle gradients and precise line work to guide the user's eye. The environment is designed to feel like a high-performance workshop: quiet, organized, and responsive. Motion should be limited to swift, linear transitions that reinforce the tool's efficiency.

## Colors
The system utilizes a dual-mode strategy. The **Dark Mode** is the primary state, designed to reduce eye strain during long coding sessions, using a deep navy-black palette. The **Light Mode** provides a high-contrast, paper-like alternative for documentation review.

The primary brand expression is a **linear gradient** spanning from a vibrant purple-blue to a deep indigo. This is reserved for primary conversion actions and thin navigational accents to prevent visual fatigue. Semantic colors (Success, Error, Warning) are used sparingly for status indicators and toast notifications.

## Typography
The system employs a dual-typeface hierarchy. **Inter** handles all UI chrome, headings, and instructional text, providing a neutral, highly legible sans-serif foundation. **JetBrains Mono** is the functional workhorse, utilized for all code input areas, HTML output displays, and technical labels (e.g., file sizes, line counts).

Type sizes are kept intentionally small and "tight" to maximize screen real estate for content. Labels are occasionally transformed to uppercase with slight letter-spacing to distinguish them from interactive text.

## Layout & Spacing
This design system follows a **Fixed-Fluid Hybrid** model. The main application interface is a split-pane view (Two-panel layout) that fills the viewport.

- **Desktop:** A 12-column underlying structure is used for marketing or settings pages, but the core editor uses a 50/50 or 40/60 split with a 1px divider (the "panel-gap") mimicking an IDE interface.
- **Mobile:** The layout reflows into a stacked vertical arrangement or a tabbed view (Switching between "Markdown" and "Preview").
- **Spacing Rhythm:** Based on a 4px scale. Components use tight padding (8px - 12px) to maintain a dense, professional feel.

## Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional shadows. 
- **Level 0 (Background):** The base application color.
- **Level 1 (Panels):** Surface color used for the editor and preview containers. In dark mode, this is a slightly lighter grey-blue than the background.
- **Overlays (Toasts/Modals):** These use a subtle ambient shadow (15% opacity) and a 1px translucent border to lift them from the functional surface.
- **Dividers:** Use low-contrast 1px borders (#E4E7EB in light, #2E3245 in dark) to separate functional zones without creating visual noise.

## Shapes
The shape language is precise and geometric. 
- **Surfaces/Cards:** Use an 8px radius (`rounded-lg`) to provide a modern, friendly container feel.
- **Interactive Elements:** Buttons and Input fields use a 4px radius (`rounded-sm`) to maintain a "tool-like" and professional appearance.
- **Selection States:** Tabs or active list items use the same 4px radius.

## Components
- **Primary Buttons:** Apply the purple-to-blue gradient background with white text. On hover, the gradient slightly shifts in saturation.
- **Secondary Buttons:** Outlined with a 1px border. In dark mode, the border is a muted version of the accent color; in light mode, it is a neutral grey.
- **Input Fields:** Monospace text (JetBrains Mono). The active state is indicated by a 1px solid accent border—no glow or heavy shadows.
- **Two-Panel Containers:** The central feature. The left (Input) and right (Output) panels should have independent scrollbars that are slim and unobtrusive.
- **Syntax Highlighting:** Use a palette inspired by the "Nord" or "Sublime" themes, ensuring high contrast against the surface colors defined in Section 2.
- **Toast Notifications:** Fixed to the bottom-right. They feature a solid 4px left-border colored by their semantic status (Success/Error).
- **Navbar:** A slim top bar (48px height) with a 1px bottom border and the brand gradient as a thin 2px accent line at the very top.