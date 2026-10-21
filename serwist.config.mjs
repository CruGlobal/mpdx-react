import { serwist } from '@serwist/next/config';

export default await serwist({
  swSrc: 'src/sw/index.ts',
  swDest: 'public/sw.js',
  // The default would precache page HTML, and pages can carry donor data
  precachePrerendered: false,
  // public/locales is left out on purpose: precaching every language is ~7MB
  globPatterns: [
    '.next/static/**/*',
    'public/icons/**/*',
    'public/images/**/*',
    'public/manifest.json',
  ],
  globIgnores: ['**/*.map'],
  manifestTransforms: [
    // Next requests dynamic route chunks with encoded brackets, so the precache keys must match
    // (the same encoding @serwist/next's webpack plugin applies)
    (entries) => ({
      manifest: entries.map((entry) => ({
        ...entry,
        url: entry.url
          .replaceAll('[', '%5B')
          .replaceAll(']', '%5D')
          .replaceAll('@', '%40'),
      })),
      warnings: [],
    }),
  ],
  esbuildOptions: {
    // Next's default browserslist with Safari raised from 12 to 14.1:
    // esbuild can't lower async arrow functions with destructured params for older Safari
    target: ['chrome64', 'edge79', 'firefox67', 'opera51', 'safari14.1'],
  },
});
