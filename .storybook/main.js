const path = require('path');

module.exports = {
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.(graphql|gql)$/,
            include: path.resolve(__dirname, '../'),
            exclude: /node_modules/,
            use: [
                {
                    loader: 'graphql-tag/loader',
                },
            ],
        });
        return config;
    },
    addons: [
        '@storybook/addon-actions/register',
        '@storybook/addon-viewport/register',
        '@storybook/addon-knobs/register',
    ],
};
