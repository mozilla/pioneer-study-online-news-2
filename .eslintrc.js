module.exports = {
  env: {
    browser: true,
    es6: true,
    webextensions: true
  },
  extends: [
    "eslint:recommended",
    "plugin:mozilla/recommended"
  ],
  globals: {
    addMessageListener: false,
    sendAsyncMessage: false,
    content: false
  },
  plugins: [
    "json",
    "mozilla"
  ],
  root: true,
  rules: {
    "mozilla/use-chromeutils-import": "off",

    "eqeqeq": "error",
    "no-global-assign": "warn",
    "no-implicit-globals": "off",
    "no-return-await": "warn",
    "no-var": "error",
    "no-warning-comments": "warn",
    "prefer-const": "error",
    "quotes": ["error", "double"]
  }
};
