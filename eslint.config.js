export default [
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        Promise: 'readonly',
        // Node.js globals for build scripts
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        // Reveal.js globals
        Reveal: 'readonly',
        // Typed.js globals
        Typed: 'readonly',
      },
    },
    rules: {
      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',
      'prefer-template': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],

      // Code Quality
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      'require-await': 'warn',
      'no-throw-literal': 'error',

      // Style (handled by Prettier mostly)
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],

      // ES6+
      'arrow-spacing': 'error',
      'no-duplicate-imports': 'error',
      'prefer-destructuring': ['warn', { object: true, array: false }],
      'template-curly-spacing': ['error', 'never'],

      // Error Prevention
      'no-unsafe-negation': 'error',
      'no-unsafe-finally': 'error',
      'no-unreachable': 'error',
      'no-constant-condition': 'warn',
    },
  },
  {
    files: ['gulpfile.js', 'gulpfile.*.js'],
    languageOptions: {
      globals: {
        gulp: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.html', '**/*.mustache'],
    plugins: {
      html: (await import('eslint-plugin-html')).default,
    },
    rules: {
      // Relax some rules for inline scripts in HTML
      'no-undef': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.min.js', '*.min.css'],
  },
];
