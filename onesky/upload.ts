const fs = require('fs');
const glob = require('glob');
const onesky = require('@brainly/onesky-utils');

const options = {
  secret: process.env.ONESKY_API_SECRET,
  apiKey: process.env.ONESKY_API_KEY,
  projectId: '367075',
  format: 'HIERARCHICAL_JSON',
  keepStrings: false,
  language: 'en',
};

glob('public/locales/en/*.json', (_er, paths) => {
  paths.forEach((path: string) => {
    const content = fs.readFileSync(path, 'utf8').toString();
    const fileName = path.split('/').pop();
    onesky.postFile({ ...options, content, fileName });
  });
});

export {};
