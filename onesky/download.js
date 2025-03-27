/* eslint-disable no-console */

const fs = require('fs');
const onesky = require('@brainly/onesky-utils');

const options = {
  secret: process.env.ONESKY_API_SECRET,
  apiKey: process.env.ONESKY_API_KEY,
  projectId: process.env.ONESKY_PROJECT_ID,
};

onesky
  .getLanguages(options)
  .then(function (content) {
    let languages = JSON.parse(content);
    languages.data.map((lang, _index) => {
      if (lang.code !== 'en' && lang.translation_progress !== '0.0%') {
        onesky
          .getFile({
            ...options,
            language: lang.code,
            fileName: 'translation.json',
          })
          .then(function (langContent) {
            if (!fs.existsSync('public/locales/' + lang.code)) {
              fs.promises.mkdir('public/locales/' + lang.code);
            }
            const sortedContent = Object.fromEntries(
              Object.entries(JSON.parse(langContent)).sort(([key1], [key2]) =>
                key1.localeCompare(key2),
              ),
            );
            fs.promises.writeFile(
              'public/locales/' + lang.code + '/translation.json',
              JSON.stringify(sortedContent, null, 2),
            );
            // For printing results in CLI log
            // console.log(sortedContent);
          })
          .catch(function (langError) {
            console.log(langError); // log error results
          });
      }
    });
  })
  .catch(function (error) {
    console.log(error);
  });
