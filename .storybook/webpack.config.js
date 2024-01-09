const path = require('path');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [require.resolve('babel-preset-react-app')],
    },
  });

  config.resolve.extensions.push('.ts', '.tsx');
  config.resolve.modules.push(path.resolve(__dirname, '..')); // allows to import components url starting from 'src' for storybook

  return config;
};
