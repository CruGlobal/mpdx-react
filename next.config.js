const withPlugins = require('next-compose-plugins');
const withPWA = require('next-pwa');
const withOptimizedImages = require('next-optimized-images');
const withGraphql = require('next-plugin-graphql');

const prod = process.env.NODE_ENV === 'production';
let SiteUrl;

if (process.env.SITE_URL) {
  SiteUrl = process.env.SITE_URL;
} else if (process.env.VERCEL_URL) {
  SiteUrl = `https://${process.env.VERCEL_URL}`;
} else {
  SiteUrl = 'http://localhost:3000';
}

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
      JWT_SECRET:
        process.env.JWT_SECRET ||
        'aed8e0786376a2abe15f5c8f8e2ee74565d0915897b33296594bb1b549098ba7',
      API_URL: process.env.API_URL || 'https://api.stage.mpdx.org/graphql',
      SITE_URL: SiteUrl,
      CLIENT_ID: process.env.CLIENT_ID || '4027334344069527005',
      CLIENT_SECRET:
        process.env.CLIENT_SECRET ||
        'V3WBTfLMgXBuL6XNTPm13CIK7Cwvtb0VnQpeQH-Oojx6kuzaD7durA',
      BEACON_TOKEN:
        process.env.BEACON_TOKEN || '01b4f5f0-7fff-492a-b5ec-d536f3657d10',
    },
    // Force .page prefix on page files (ex. index.page.tsx) so generated files can be included in /pages directory without Next.js throwing build errors
    pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  },
]);
