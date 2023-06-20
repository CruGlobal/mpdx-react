module.exports = {
  indentation: 4,
  lexers: {
    js: ['JsxLexer'],
    ts: ['JsxLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],
    default: ['JsxLexer'],
  },
  locales: ['en'],
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{js,jsx,ts,tsx}', 'pages/**/*.{jsx,tsx}'],
  verbose: true,
  nsSeparator: false,
  namespaceSeparator: false,
  keySeparator: false,
  useKeysAsDefaultValue: true,
};
