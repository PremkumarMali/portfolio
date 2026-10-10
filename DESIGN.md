---
# gstack: design-md-format=spec
name: Premkumar Mali Portfolio
description: Clean product-studio portfolio. Calm neutrals, one cobalt accent, real screenshots doing the talking.
colors:
  primary: "#2348d8"
  on-primary: "#ffffff"
  primary-hover: "#1a3ab8"
  surface: "#ffffff"
  background: "#fafaf9"
  text: "#111214"
  text-muted: "#5b606a"
  border: "#e3e3e0"
  accent-soft: "#edf0fc"
  dark-primary: "#7d95ff"
  dark-background: "#0f1012"
  dark-surface: "#141518"
  dark-text: "#ececee"
  dark-text-muted: "#9a9ea8"
  dark-border: "#26282d"
typography:
  display:
    fontFamily: General Sans
    fontWeight: 600
    fontSize: clamp(2.75rem, 8vw, 5.25rem)
    letterSpacing: -0.035em
  body:
    fontFamily: General Sans
    fontSize: 1.0625rem
    lineHeight: 1.6
  label:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    letterSpacing: 0.02em
  mono:
    fontFamily: JetBrains Mono
rounded:
  sm: 6px
  md: 8px
  lg: 14px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
---

# Premkumar Mali Portfolio

## Overview

**Creative North Star:** a quiet, product-team finish where the projects (real screenshots, concrete features) carry the page.
**Product context:** personal portfolio of a student full-stack / AI developer, read by recruiters and engineers, mostly on laptops in daytime.
**Mode:** Persuade (hero, projects), Read (about, experience).
**Reference:** structure of the projects section follows https://portfolioshivamraghuwanshi.netlify.app/ (large cards, category, features, tags, then "More projects"); the visual language deliberately does not.

## Colors

**Strategy:** Restrained. One cobalt accent for actions, category labels and bullet ticks; everything else is neutral.
**Light or dark:** follows the visitor's system setting, toggle in the nav. Dark mode lifts the accent to `dark-primary` for contrast and keeps the same hierarchy through surface steps, not glows.

## Typography

General Sans (Fontshare) for everything readable: one family keeps it calm and product-like. JetBrains Mono (Google Fonts) only for tiny data: project categories and dates. Display at 600 weight, tight tracking, never italic.

## Layout

72rem max width, 16px side gutter on phones. Projects: first featured card spans the full width (image left, text right), the rest sit in two columns, then a compact auto-fill grid. Section headings stand alone, no small labels above them.

## Elevation & Depth

Borders first. Cards gain a soft offset shadow on hover only. No glows, no blur halos.

## Shapes

6px chips, 8px buttons and inputs, 14px cards.

## Components

Buttons: solid accent primary, bordered secondary; hover darkens or outlines, focus shows a 2px accent ring. Project cards (two equal columns): plain sentence-case category, title, description, feature bullets, tech chips, Code / Live demo.

## Do's and Don'ts

- Do: use real feature facts from the repo. Project cards start with the text, no screenshots, diagrams or decorative gradients.
- Do: keep one accent; add emphasis with size and weight.
- Don't: put labels/kickers above section headings.
- Don't: use italic display type, cream grounds, glow effects or gradient buttons.
- Don't: show fake metrics or placeholder images.

## Motion

- **Approach:** intentional.
- **Easing:** cubic-bezier(0.16, 1, 0.3, 1) for entrances.
- **Duration:** 150ms hovers, 700–900ms entrances.
- **The one authored moment:** the name rising word by word on the first visit of a session (~1.2s total); off for reduced motion.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-10-10 | Clean product-studio system replaces editorial serif/orange | User felt the editorial look read as AI-generated; chosen in /design-consultation |
| 2026-10-10 | Dark is the default theme; page background is a fixed two-colour gradient (cobalt top-left, teal bottom-right); cards use a lighter navy (#162039) than the page | User request: darker, dual-gradient site with cards distinct from the background |
| 2026-10-10 | Dark background is now dark blue (top-left) fading to near-black (bottom-right); teal glow removed | User request: dark blue + black dual gradient |
