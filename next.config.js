const bundleAnalyzer = require('@next/bundle-analyzer');
const withPlugins = require('next-compose-plugins');
const withOptimizedImages = require('next-optimized-images');
const withPWA = require('next-pwa');
require('dotenv').config();

if (process.env.secrets && process.env.secrets !== '{}') {
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

const siteUrl =
  process.env.PREVIEW_URL ?? process.env.SITE_URL ?? 'http://localhost:3000';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Remove empty strings and missing values from the object
const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_key, value]) => !!value));

/** @type {import('next').NextConfig} */
const config = {
  env: compact({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    JWT_SECRET: process.env.JWT_SECRET ?? 'development-key',
    API_URL: process.env.API_URL ?? 'https://api.stage.mpdx.org/graphql',
    REST_API_URL:
      process.env.REST_API_URL ?? 'https://api.stage.mpdx.org/api/v2/',
    OAUTH_URL: process.env.OAUTH_URL ?? 'https://auth.stage.mpdx.org',
    SITE_URL: siteUrl,
    CLIENT_ID: process.env.CLIENT_ID ?? '4027334344069527005',
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    AUTH_PROVIDER: process.env.AUTH_PROVIDER ?? 'OKTA',
    OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID ?? '0oa1n0gjoy3j5Ycdg0h8',
    OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
    OKTA_ISSUER: process.env.OKTA_ISSUER ?? 'https://signon.okta.com',
    OKTA_SIGNOUT_REDIRECT_URL: process.env.OKTA_SIGNOUT_REDIRECT_URL ?? siteUrl,
    API_OAUTH_CLIENT_ID:
      process.env.API_OAUTH_CLIENT_ID ??
      '3nxoth_gyetHdpjKp2WYkND1PUQlvYcjXQHW9ZdDxq4',
    API_OAUTH_CLIENT_SECRET: process.env.API_OAUTH_CLIENT_SECRET,
    API_OAUTH_ISSUER_AUTHORIZATION_URL:
      process.env.API_OAUTH_ISSUER_AUTHORIZATION_URL ??
      'https://api.stage.mpdx.org/oauth/authorize',
    API_OAUTH_ISSUER_TOKEN_URL:
      process.env.API_OAUTH_ISSUER_TOKEN_URL ??
      'https://api.stage.mpdx.org/oauth/token',
    API_OAUTH_SCOPE: process.env.API_OAUTH_SCOPE ?? 'read write',
    API_OAUTH_VISIBLE_NAME: process.env.API_OAUTH_VISIBLE_NAME ?? 'SSO',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
    GOOGLE_TAG_MANAGER_CONTAINER_ID:
      process.env.GOOGLE_TAG_MANAGER_CONTAINER_ID,
    ROLLBAR_ACCESS_TOKEN: process.env.ROLLBAR_ACCESS_TOKEN,
    ONESKY_API_SECRET: process.env.ONESKY_API_SECRET,
    ONESKY_API_KEY: process.env.ONESKY_API_KEY,
    APP_NAME: process.env.APP_NAME ?? 'MPDX',
    ROLLBAR_SERVER_ACCESS_TOKEN: process.env.ROLLBAR_SERVER_ACCESS_TOKEN,
    DATADOG_APP_ID: process.env.DATADOG_APP_ID,
    DATADOG_CLIENT_TOKEN: process.env.DATADOG_CLIENT_TOKEN,
    DATADOG_CONFIGURED: Boolean(
      process.env.NODE_ENV === 'production' &&
        process.env.DATADOG_APP_ID &&
        process.env.DATADOG_CLIENT_TOKEN,
    ).toString(),
    HELPJUICE_ORIGIN: process.env.HELPJUICE_ORIGIN,
    HELPJUICE_KNOWLEDGE_BASE_URL: process.env.HELPJUICE_KNOWLEDGE_BASE_URL,
    HELP_URL_COACHING_ACTIVITY: process.env.HELP_URL_COACHING_ACTIVITY,
    HELP_WHATS_NEW_URL: process.env.HELP_WHATS_NEW_URL,
    HELP_WHATS_NEW_IMAGE_URL: process.env.HELP_WHATS_NEW_IMAGE_URL,
    HELP_URL_COACHING_APPOINTMENTS_AND_RESULTS:
      process.env.HELP_URL_COACHING_APPOINTMENTS_AND_RESULTS,
    HELP_URL_SETUP_FIND_ORGANIZATION:
      process.env.HELP_URL_SETUP_FIND_ORGANIZATION,
    ALERT_MESSAGE: process.env.ALERT_MESSAGE,
    PRIVACY_POLICY_URL: process.env.PRIVACY_POLICY_URL,
    TERMS_OF_USE_URL: process.env.TERMS_OF_USE_URL,
    DD_ENV: process.env.DD_ENV ?? 'development',
  }),
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
  swcMinify: true,
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.module.rules.push(
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'graphql-tag/loader',
          },
        ],
      },
    );

    const imageLoaderRule = config.module.rules.find(
      (rule) => rule.loader === 'next-image-loader',
    );
    imageLoaderRule.exclude = /\.svg$/;

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
  redirects: async () => [
    {
      source: '/accountLists/:accountListId/settings',
      destination: '/accountLists/:accountListId/settings/preferences',
      permanent: true,
    },
  ],
};

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
  // Workaround @next/bundle-analyzer not playing nicely with next-compose-plugins
  // https://github.com/cyrilwanner/next-compose-plugins/issues/26
  withBundleAnalyzer(config),
]);
