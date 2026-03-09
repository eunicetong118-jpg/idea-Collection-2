# Design: Washi Paper Matrix Theme

**Date**: 2026-03-09
**Status**: Approved

## Overview
A complete redesign of the "Idea Collection" interface, moving from the "Lab" (Retro-Futuristic) aesthetic to an "Organic / Zen" atmosphere named **Washi Paper Matrix**.

## Aesthetic Direction
- **Concept**: Layers of delicate, translucent washi paper stacked on a solid surface.
- **Tone**: Calm, focused, tactile, and natural.
- **Core Colors**:
  - Canvas: Cream (#FFF1B5)
  - Accents: Soft Blue (#C1DBE8)
  - Ink (Text): Deep Brown (#43302E)

## Visual Language
- **Backgrounds**: Warm Cream with a subtle paper fiber texture (noise).
- **Shadows**: Soft, high-blur "ink bleed" shadows using low-opacity Deep Brown.
- **Borders**: Minimal to none; depth is created through layering and shadow rather than lines.
- **Border Radii**: Large, organic, and slightly variable (e.g., `2rem`) to mimic hand-cut paper.

## Component Architecture
- **Cards (Sheets)**: Floating sheets of translucent paper that "lift" on hover.
- **Navigation**: A translucent strip with Soft Blue ink washes behind active nodes.
- **Typography**: Humanist Sans-serif (clean, rounded, friendly).
- **Action Elements**: "Ink Stone" inspired buttons in Deep Brown with smooth, fluid transitions.

## Interaction & Motion
- **Transitions**: Slow, graceful "fluid" easing (0.5s) to reinforce the Zen atmosphere.
- **Micro-interactions**: Subtle opacity shifts and soft shadow expansions.

## Technical Constraints
- Framework: Next.js / Tailwind CSS.
- Color Consistency: Centralized CSS variables in `globals.css`.
- Performance: Minimal use of heavy assets; preference for CSS-based noise and gradients.
