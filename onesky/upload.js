/* eslint-disable no-console */

const onesky = require('@brainly/onesky-utils');
const fs = require('fs');

const translations = fs.readFileSync(
  'public/locales/en/translation.json',
  'utf-8',
);
const options = {
  language: 'en',
  secret: process.env.ONESKY_API_SECRET,
  apiKey: process.env.ONESKY_API_KEY,
  projectId: process.env.ONESKY_PROJECT_ID,
  fileName: 'translation.json',
  format: 'HIERARCHICAL_JSON',
  content: translations,
  keepStrings: true,
};

onesky
  .postFile(options)
  .then(function (content) {
    console.log(content);
  })
  .catch(function (error) {
    console.log(error);
  });
