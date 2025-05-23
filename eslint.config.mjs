import nodePlugin from 'eslint-plugin-node';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  {
    files: ['**/*.js', '**/*.cjs'],
    ignores: ['node_modules/', 'dist/', 'build/', 'coverage/', 'logs/', '*.min.js', '.env'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module' // since your project is module
    },
    plugins: {
      node: nodePlugin,
      prettier: prettierPlugin
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'node/no-unsupported-features/es-syntax': ['off'], // Since your project is module already
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: true,
          printWidth: 80
        }
      ]
    }
  }
];
