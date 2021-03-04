// This file is here for Jest to pick up the "next/babel" preset

module.exports = {
  presets: ['next/babel'],
  plugins: [
    // Minimize Material UI bundle size when importing named imports from package https://material-ui.com/guides/minimizing-bundle-size/#option-2
    [
      'babel-plugin-transform-imports',
      {
        '@material-ui/core': {
          transform: '@material-ui/core/esm/${member}',
          preventFullImport: true,
        },
        '@material-ui/icons': {
          transform: '@material-ui/icons/esm/${member}',
          preventFullImport: true,
        },
      },
    ],
  ],
};
