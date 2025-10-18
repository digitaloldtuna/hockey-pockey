module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // enables eslint-plugin-prettier and eslint-config-prettier
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // show Prettier errors as ESLint errors
  },
  ignorePatterns: ['server/dist/', 'client/build/', 'scripts/vendor/*'],
};
