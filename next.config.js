const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withOptimizedImages = require('next-optimized-images');
const withGraphql = require('next-plugin-graphql');
require('dotenv').config();

process.env.JWT_SECRET = JSON.parse(process.env.secrets).JWT_SECRET;
process.env.OKTA_CLIENT_SECRET = JSON.parse(
  process.env.secrets,
).OKTA_CLIENT_SECRET;

const prod = process.env.NODE_ENV === 'production';

if (prod && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const siteUrl =
  process.env.VERCEL_GIT_COMMIT_REF === 'main'
    ? 'https://next.mpdx.org'
    : process.env.VERCEL_GIT_COMMIT_REF === 'staging'
    ? 'https://next.stage.mpdx.org'
    : process.env.SITE_URL
    ? process.env.SITE_URL
    : 'http://localhost:3000';

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
    serverRuntimeConfig: {
      NEXTAUTH_URL: siteUrl,
    },
    env: {
      JWT_SECRET: process.env.JWT_SECRET ?? 'development-key',
      API_URL: process.env.API_URL ?? 'https://api.stage.mpdx.org/graphql',
      REST_API_URL:
        process.env.REST_API_URL ?? 'https://api.stage.mpdx.org/api/v2/',
      SITE_URL: siteUrl,
      CLIENT_ID: process.env.CLIENT_ID ?? '4027334344069527005',
      CLIENT_SECRET: process.env.CLIENT_SECRET,
      BEACON_TOKEN:
        process.env.BEACON_TOKEN ?? '01b4f5f0-7fff-492a-b5ec-d536f3657d10',
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID ?? '0oa1n0gjoy3j5Ycdg0h8',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER ?? 'https://signon.okta.com',
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      GOOGLE_GEOCODE_API_KEY: process.env.GOOGLE_GEOCODE_API_KEY,
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
  },
]);
