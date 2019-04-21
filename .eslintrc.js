module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    "arrow-parens": "off",
    "no-param-reassign": "off",
    "class-methods-use-this": "off",
    "import/newline-after-import": "off",
    "lines-between-class-members": "off",
    "consistent-return": "off",
    "no-shadow": "off",
    indent: ['error', 2, { "SwitchCase": 0, MemberExpression: 0 }],
  },
};
