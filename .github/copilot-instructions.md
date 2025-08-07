# GitHub Copilot Instructions

## Project Overview

MPDX is a Next.js 15 React application built with TypeScript using pages router.

## Technology Stack

- **Frontend**: Next.js v15, React, Material UI v5, TypeScript
- **Data Loading**: Apollo Client GraphQL
- **Testing**: Jest, React Testing Library v13
- **Internationalization**: react-i18next
- **Code Quality**: ESLint, Prettier

## File Naming Conventions

- React components: PascalCase (e.g., `ComponentName.tsx`) without default export
- Pages: kebab-case with `.page.tsx` extension (e.g., `account-lists.page.tsx`)
- Test files: Same name as the file being tested with `.test.tsx` extension
- GraphQL files: PascalCase with `.graphql` extension not starting with `Get` or `Load`

## Commands

- **Always use `yarn` for package management and running scripts**
- `yarn test` - Run tests
- `yarn test [file]` - Run tests for a single file
- `yarn lint` - Run ESLint linter
- `yarn lint:ts` - Run TypeScript typechecking
- `yarn prettier:write` - Run Prettier formatter
