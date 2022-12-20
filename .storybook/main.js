const path = require('path');

module.exports = {
  webpackFinal: async (config) => {
    config.module.rules.push(
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(graphql|gql)$/,
        include: path.resolve(__dirname, '../'),
        exclude: /node_modules/,
        use: [
          {
            loader: 'graphql-tag/loader',
          },
        ],
      },
    );
    return config;
  },
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-viewport/register',
    '@storybook/addon-controls',
    'storybook-addon-i18next/register',
    'storybook-addon-designs',
  ],
};
