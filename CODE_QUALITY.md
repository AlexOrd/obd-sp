# Code Quality Setup

This project uses **Prettier** for code formatting and **ESLint** for linting JavaScript code.

## Tools

### Prettier

- **Purpose**: Automatic code formatting
- **Configuration**: `.prettierrc.json`
- **Ignore rules**: `.prettierignore`
- **Supported files**: JavaScript, CSS, HTML, JSON, Mustache templates

### ESLint

- **Purpose**: Code quality and error checking
- **Configuration**: `eslint.config.js`
- **Rules**: ES6+ best practices, error prevention, code quality

## NPM Scripts

### Formatting

```bash
# Format all code files
npm run format

# Check if code is formatted (doesn't modify files)
npm run format:check
```

### Linting

```bash
# Lint JavaScript files
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Run both lint and format check
npm run validate
```

### Build Integration

The production build (`npm run build` or `npm run build:prod`) automatically:

1. ✅ Runs ESLint to check for code errors
2. ✅ Checks code formatting with Prettier
3. ✅ Fails the build if there are linting or formatting issues

## IDE Integration

### VS Code

Configuration is already set up in `.vscode/settings.json`:

- ✅ Format on save enabled
- ✅ Auto-fix ESLint issues on save
- ✅ Prettier as default formatter

**Recommended Extensions:**

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Configuration Details

### Prettier Rules

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes for JS, double for CSS
- **Semicolons**: Always
- **Trailing Commas**: ES5 compatible
- **Arrow Parens**: Always
- **End of Line**: LF (Unix)

### ESLint Rules

- ✅ ES6+ syntax required (no `var`)
- ✅ Prefer `const` over `let`
- ✅ Strict equality (`===`)
- ✅ No unused variables
- ✅ No `console.log` (warnings only)
- ✅ Arrow function spacing
- ✅ No duplicate imports
- ✅ Template string spacing

## Pre-commit Hook (Optional)

To automatically format and lint before each commit, you can add a pre-commit hook:

```bash
# Install husky (optional)
npm install --save-dev husky lint-staged

# Add to package.json:
{
  "lint-staged": {
    "*.{js,css,html,json,mustache}": "prettier --write",
    "*.js": "eslint --fix"
  }
}
```

## Gulp Tasks

The following Gulp tasks are available:

- `gulp format` - Format all source files with Prettier
- `gulp lint` - Lint JavaScript files with ESLint
- `gulp check` - Check formatting without modifying files
- `gulp validate` - Run both lint and format check
- `gulp build` - Production build with automatic validation

## Ignoring Files

Files and directories ignored by linting/formatting:

- `dist/` - Build output
- `node_modules/` - Dependencies
- `*.min.js` / `*.min.css` - Minified files
- `.vscode/` - IDE settings (except our config)
- `package-lock.json` - Lock files

## Best Practices

1. **Before committing**: Run `npm run validate` to check for issues
2. **Use the IDE**: Enable format on save in VS Code
3. **Fix automatically**: Use `npm run lint:fix` for auto-fixable issues
4. **Check CI**: Production builds will fail if code quality checks fail
5. **Review changes**: Always review auto-formatted code before committing

## Troubleshooting

### Prettier not working in VS Code

1. Install the Prettier extension
2. Set as default formatter: `Ctrl/Cmd + Shift + P` → "Format Document With..." → "Prettier"
3. Enable format on save in settings

### ESLint errors

1. Check `eslint.config.js` for rules
2. Use `npm run lint:fix` to auto-fix
3. Add `// eslint-disable-next-line` for specific exceptions

### Build failing

1. Run `npm run validate` to see issues
2. Fix linting errors: `npm run lint:fix`
3. Format code: `npm run format`
4. Commit and rebuild
