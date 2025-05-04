# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Lint/Test Commands
- Build: `npm run build`
- Lint: `npm run lint` 
- Test (all): `npm test`
- Test (single): `npm test -- -t "test name"`
- Format: `npm run format`
- Start dev server: `npm run dev`

## Code Style Guidelines
- **Formatting**: Use Prettier with default settings
- **Naming**: camelCase for variables/functions, PascalCase for classes/components
- **Imports**: Group imports (external, internal, types) with a blank line between groups
- **Types**: Use TypeScript types/interfaces; avoid `any` type
- **Error Handling**: Use try/catch for async operations; centralize error logging
- **Functions**: Keep functions small and focused on a single responsibility
- **Comments**: Use JSDoc for public API documentation