# CLAUDE.md

## Project Overview

Engagement Card Builder — a standalone tool for creating and previewing engagement cards for the PayPal App homepage. Built with React 19 + TypeScript + Tailwind CSS 4, powered by the Oslo Design System.

## Commands

- `npm run dev` — Vite dev server with HMR
- `npm run build` — TypeScript check + Vite build

## Architecture

### Oslo Design System Dependency

This project consumes `@oslo/design-system` from the sibling folder `../oslo-design-system/`. During development, Vite resolves the package directly to Oslo's source (`src/index.ts`) for instant HMR — no rebuild needed when Oslo components change.

Components used from Oslo: `CollectionDeck`, `FlickerCard`, `BottomNav`, `BottomNavItem`, `OsloPlus`, `cn`.

Design tokens are imported via `@oslo/design-system/tokens.css`.

### File Structure

- `src/ECBuilder.tsx` — Main builder layout, ZIP import/export, clipboard copy
- `src/ECBuilderForm.tsx` — Left panel: card tabs, image upload, scale/position controls, title/subtitle/CTA fields, a11y toggle
- `src/ECBuilderPreview.tsx` — Right panel: iPhone device frame with live `CollectionDeck` + `FlickerCard` preview
- `src/main.tsx` — Entry point

### Content Designer Skill

The Oslo content designer skill is available at `.claude/skills/oslo-content-designer/` for AI-assisted content design guidance following PayPal XD content standards.
