# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Test Commands
- Build project: `grunt default`
- Format and lint: `grunt format`
- Run tests: `npx playwright test`
- Run single test: `npx playwright test test/e2e/path/to/test.test.js`
- Start test server: `node test/server.js`
- Test with specific browser: `npx playwright test --project=chromium`

## Code Style Guidelines
- JavaScript: ES6+, esversion 11
- Formatting: Prettier with singleQuote: true, trailingComma: "none"
- Testing: Playwright for E2E tests, Jest for unit tests
- Style the code like existing files, following established patterns
- Use jshint for linting
- Components use custom HTML elements pattern
- Prefer absolute paths over relative paths
- MapML is a custom extension of HTML for maps
- Prefer async/await in test files
- Error handling should follow existing patterns in similar code
- Include meaningful test descriptions