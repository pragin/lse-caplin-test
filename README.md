# FTSE 100 Playwright Test Suite

This project uses [Playwright](https://playwright.dev/) to automate browser testing for the FTSE 100 index in London Stock Exchange website.

## Features

- Automated UI tests for FTSE 100 constituents
- Tests for sorting by percentage change and market cap
- Data extraction and filtering
- API response interception and analysis

## Project Structure

```
.
├── tests/                  # Playwright test specs
│   └── ftse100.spec.ts     # Main test file
├── utils/                  # Helper utilities
│   └── constituentsHelper.ts
├── playwright.config.ts    # Playwright configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/pragin/lse-caplin-test.git
   cd lse-caplin-test
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

### Running Tests

To run all Playwright tests:

```sh
npx playwright test
```

To run a specific test file:

```sh
npx playwright test tests/ftse100.spec.ts
```

To run tests with NPM script:

```sh
npm run test:pw
```

### Viewing Reports

After running tests, view the HTML report:

```sh
npx playwright show-report
```
