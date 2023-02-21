const path = require('path');
const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withOptimizedImages = require('next-optimized-images');
const withGraphql = require('next-plugin-graphql');
require('dotenv').config();

if (process.env.secrets) {
  process.env.JWT_SECRET = JSON.parse(process.env.secrets).JWT_SECRET;
  process.env.OKTA_CLIENT_SECRET = JSON.parse(
    process.env.secrets,
  ).OKTA_CLIENT_SECRET;
  process.env.API_OAUTH_CLIENT_SECRET = JSON.parse(
    process.env.secrets,
  ).API_OAUTH_CLIENT_SECRET;
  process.env.ROLLBAR_SERVER_ACCESS_TOKEN = JSON.parse(
    process.env.secrets,
  ).ROLLBAR_SERVER_ACCESS_TOKEN;
}

const prod = process.env.NODE_ENV === 'production';

if (prod && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins([
  [
    withPWA,
    {
      pwa: {
        dest: 'public',
        disable: !prod,
      },
    },
  ],
  withOptimizedImages,
  withGraphql,
  withBundleAnalyzer,
  {
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      JWT_SECRET: process.env.JWT_SECRET ?? 'development-key',
      API_URL: process.env.API_URL ?? 'https://api.stage.mpdx.org/graphql',
      REST_API_URL:
        process.env.REST_API_URL ?? 'https://api.stage.mpdx.org/api/v2/',
      SITE_URL: siteUrl,
      CLIENT_ID: process.env.CLIENT_ID ?? '4027334344069527005',
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      BEACON_TOKEN:
        process.env.BEACON_TOKEN ?? '01b4f5f0-7fff-492a-b5ec-d536f3657d10',
      AUTH_PROVIDER: process.env.AUTH_PROVIDER ?? 'OKTA',
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID ?? '0oa1n0gjoy3j5Ycdg0h8',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER ?? 'https://signon.okta.com',
      OKTA_SIGNOUT_REDIRECT_URL:
        process.env.OKTA_SIGNOUT_REDIRECT_URL ?? 'https://mpdx.org/logout',
      API_OAUTH_CLIENT_ID:
        process.env.API_OAUTH_CLIENT_ID ??
        '3nxoth_gyetHdpjKp2WYkND1PUQlvYcjXQHW9ZdDxq4',
      API_OAUTH_CLIENT_SECRET: process.env.API_OAUTH_CLIENT_SECRET,
      API_OAUTH_ISSUER:
        process.env.API_OAUTH_ISSUER ?? 'https://api.stage.mpdx.org',
      API_OAUTH_VISIBLE_NAME: process.env.API_OAUTH_VISIBLE_NAME ?? 'SSO',
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      GOOGLE_TAG_MANAGER_CONTAINER_ID:
        process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID,
      ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
      ONESKY_API_SECRET: process.env.ONESKY_API_SECRET,
      ONESKY_API_KEY: process.env.ONESKY_API_KEY,
      APP_NAME: process.env.APP_NAME ?? 'MPDX',
      ROLLBAR_SERVER_ACCESS_TOKEN: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
      REWRITE_DOMAIN: process.env.REWRITE_DOMAIN ?? 'mpdx.org',
    },
    experimental: {
      modularizeImports: {
        '@mui/material': {
          transform: '@mui/material/{{member}}',
        },
        '@mui/icons-material/?(((\\w*)?/?)*)': {
          transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}',
        },
      },
    },
    // Force .page prefix on page files (ex. index.page.tsx) so generated files can be included in /pages directory without Next.js throwing build errors
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
    productionBrowserSourceMaps: true,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    reactStrictMode: true,
    styledComponents: true,
    swcMinify: true,
    webpack: (config) => {
      config.experiments = {
        ...config.experiments,
        ...{
          topLevelAwait: true,
        },
      };
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

      const fileLoaderRule = config.module.rules.find(
        (rule) => rule.test && rule.test.test('.svg'),
      );
      fileLoaderRule.exclude = /\.svg$/;

      config.module.rules.push(
        {
          test: /\.(png|jpg|gif|woff|woff2|otf|ttf|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 100000,
              },
            },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|mp3|aif)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
          ],
        },
      );

      return config;
    },
  },
]);
