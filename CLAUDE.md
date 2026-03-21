# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Wavo is a React library for rendering audio waveforms as SVG components. The library provides a flexible component-based architecture where the main `Waveform` container manages data and interactions, while child components (`Bars`, `Path`, `Progress`) handle different rendering styles.

## Development Commands

All tooling is managed through Vite+ (`vp` CLI). See the Vite+ section below for details.

### Build and Development

- `vp run build` - Type-check and build the library via `vp pack`
- `vp run dev` - Start development mode with file watching via `vp pack --watch`
- `vp run type-check` - Run TypeScript type checking

### Testing

- `vp run test` - Run all tests (unit + E2E)
- `vp run test:unit` - Run unit tests via `vp test run`
- `vp run test:unit:watch` - Run tests in watch mode via `vp test`
- `vp run test:e2e` - Run Playwright E2E tests
- Test app: `vp run dev:test` - Start test application on localhost:3000
- Test build: `vp run build:test` - Build test application

### Documentation

- `vp run dev:docs` - Start documentation site in development mode
- `vp run build:docs` - Build documentation site

### Code Quality

- `vp run lint` - Lint code via `vp lint`
- `vp run lint:fix` - Lint with auto-fix via `vp lint --fix`
- `vp run format` - Format code via `vp fmt`
- `vp run format:check` - Check formatting via `vp fmt --check`

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

- **Compound Components**: Use `Waveform`, `Waveform.Bars`, etc.
- **Context-driven**: Child components access shared state via `useWaveform()`
- **SVG-based**: All rendering uses SVG for scalability and performance
- **Type Safety**: Comprehensive TypeScript types throughout

## Package Manager

Uses `pnpm` as the underlying package manager, wrapped by Vite+ (`vp`). Use `vp` for dependency management (e.g. `vp add`, `vp install`) instead of calling pnpm directly. The workspace includes:

- Root package (main library)
- `test/` - Test application (Next.js)
- `docs/` - Documentation site (Astro)

## Testing

- **Unit Tests**: Vitest with React Testing Library for component and utility testing
- **E2E Tests**: Playwright for end-to-end testing with performance benchmarks

Tests include rendering performance and interaction scenarios.

## Build System

All build tools are unified under **Vite+** (`vp` CLI):

- **Bundler**: `vp pack` (tsdown / Rolldown) for library bundling
- **Linter**: `vp lint` (oxlint) with type-aware linting support
- **Formatter**: `vp fmt` (oxfmt) for code formatting
- **Testing**: `vp test` (Vitest) for unit tests and benchmarks
- **Git Hooks**: `vp staged` for pre-commit checks
- **Monorepo**: `vp run --filter` for workspace task orchestration
- **TypeScript**: Strict type checking required before builds

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, but it invokes Vite through `vp dev` and `vp build`.

## Vite+ Workflow

`vp` is a global binary that handles the full development lifecycle. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

### Start

- create - Create a new project from a template
- migrate - Migrate an existing project to Vite+
- config - Configure hooks and agent integration
- staged - Run linters on staged files
- install (`i`) - Install dependencies
- env - Manage Node.js versions

### Develop

- dev - Run the development server
- check - Run format, lint, and TypeScript type checks
- lint - Lint code
- fmt - Format code
- test - Run tests

### Execute

- run - Run monorepo tasks
- exec - Execute a command from local `node_modules/.bin`
- dlx - Execute a package binary without installing it as a dependency
- cache - Manage the task cache

### Build

- build - Build for production
- pack - Build libraries
- preview - Preview production build

### Manage Dependencies

Vite+ automatically detects and wraps the underlying package manager such as pnpm, npm, or Yarn through the `packageManager` field in `package.json` or package manager-specific lockfiles.

- add - Add packages to dependencies
- remove (`rm`, `un`, `uninstall`) - Remove packages from dependencies
- update (`up`) - Update packages to latest versions
- dedupe - Deduplicate dependencies
- outdated - Check for outdated packages
- list (`ls`) - List installed packages
- why (`explain`) - Show why a package is installed
- info (`view`, `show`) - View package information from the registry
- link (`ln`) / unlink - Manage local package links
- pm - Forward a command to the package manager

### Maintain

- upgrade - Update `vp` itself to the latest version

These commands map to their corresponding tools. For example, `vp dev --port 3000` runs Vite's dev server and works the same as Vite. `vp test` runs JavaScript tests through the bundled Vitest. The version of all tools can be checked using `vp --version`. This is useful when researching documentation, features, and bugs.

## Common Pitfalls

- **Using the package manager directly:** Do not use pnpm, npm, or Yarn directly. Vite+ can handle all package manager operations.
- **Always use Vite commands to run tools:** Don't attempt to run `vp vitest` or `vp oxlint`. They do not exist. Use `vp test` and `vp lint` instead.
- **Running scripts:** Vite+ commands take precedence over `package.json` scripts. If there is a `test` script defined in `scripts` that conflicts with the built-in `vp test` command, run it using `vp run test`.
- **Do not install Vitest, Oxlint, Oxfmt, or tsdown directly:** Vite+ wraps these tools. They must not be installed directly. You cannot upgrade these tools by installing their latest versions. Always use Vite+ commands.
- **Use Vite+ wrappers for one-off binaries:** Use `vp dlx` instead of package-manager-specific `dlx`/`npx` commands.
- **Import JavaScript modules from `vite-plus`:** Instead of importing from `vite` or `vitest`, all modules should be imported from the project's `vite-plus` dependency. For example, `import { defineConfig } from 'vite-plus';` or `import { expect, test, vi } from 'vite-plus/test';`. You must not install `vitest` to import test utilities.
- **Type-Aware Linting:** There is no need to install `oxlint-tsgolint`, `vp lint --type-aware` works out of the box.

## Review Checklist for Agents

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to validate changes.
<!--VITE PLUS END-->
