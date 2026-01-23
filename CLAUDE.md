# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Wavo is a React library for rendering audio waveforms as SVG components. The library provides a flexible component-based architecture where the main `Waveform` container manages data and interactions, while child components (`Bars`, `Path`, `Progress`) handle different rendering styles.

## Development Commands

### Build and Development

- `pnpm build` - Type-check and build the library using tsdown (Rolldown)
- `pnpm dev` - Start development mode with file watching
- `pnpm type-check` - Run TypeScript type checking

### Testing

- `pnpm test` - Run all tests (unit + E2E)
- `pnpm test:unit` - Run Vitest unit tests
- `pnpm test:unit:watch` - Run Vitest in watch mode
- `pnpm test:e2e` - Run Playwright E2E tests
- Test app: `pnpm dev:test` - Start test application on localhost:3000
- Test build: `pnpm build:test` - Build test application

### Documentation

- `pnpm dev:docs` - Start documentation site in development mode
- `pnpm build:docs` - Build documentation site

### Code Quality

- `pnpm lint` - Run oxlint
- `pnpm lint:fix` - Run oxlint with auto-fix
- `pnpm format` - Format code with oxfmt
- `pnpm format:check` - Check formatting without modifying files

## Architecture

### Core Components Structure

- **Waveform Container** (`src/Waveform.tsx`): Main component that manages state, interactions, and provides context
- **WaveformContext** (`src/contexts/WaveformContext.tsx`): React context providing shared state to child components
- **Child Components** (`src/components/`):
  - `Bars.tsx` - Renders waveform as vertical bars
  - `Path.tsx` - Renders waveform as SVG path with various styles
  - `Progress.tsx` - Renders progress indicator overlay
  - `WaveformSVG.tsx` - SVG wrapper component

### Hook System

- `useWaveform()` - Access waveform context data
- `useInteraction()` - Handle mouse/keyboard interactions
- `useLazyLoad()` - Intersection Observer for lazy loading
- `useStyles()` - Inject CSS styles dynamically
- `useIsClient()` - Client-side rendering detection

### Key Patterns

- **Compound Components**: Use `Waveform.Container`, `Waveform.Bars`, etc.
- **Context-driven**: Child components access shared state via `useWaveform()`
- **SVG-based**: All rendering uses SVG for scalability and performance
- **Type Safety**: Comprehensive TypeScript types throughout

## Package Manager

Uses `pnpm` as the package manager. The workspace includes:

- Root package (main library)
- `test/` - Test application (Next.js)
- `docs/` - Documentation site (Astro)

## Testing

- **Unit Tests**: Vitest with React Testing Library for component and utility testing
- **E2E Tests**: Playwright for end-to-end testing with performance benchmarks

Tests include rendering performance and interaction scenarios.

## Build System

- **Bundler**: tsdown (powered by Rolldown) for fast library bundling
- **Linter**: oxlint for high-performance linting
- **Formatter**: oxfmt for fast code formatting
- **Monorepo**: Turbo for coordinated builds across packages
- **TypeScript**: Strict type checking required before builds
