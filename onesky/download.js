const fs = require('fs');
const onesky = require('@brainly/onesky-utils');

const options = {
  secret: process.env.ONESKY_API_SECRET,
  apiKey: process.env.ONESKY_API_KEY,
  projectId: '367075',
};

onesky
  .getLanguages(options)
  .then(function (content) {
    let languages = JSON.parse(content);
    languages.data.map((lang, _index) => {
      if (lang.code !== 'en' && lang.translation_progress !== '0.0%') {
        onesky
          .getFile({
            language: lang.code,
            secret: process.env.ONESKY_API_SECRET,
            apiKey: process.env.ONESKY_API_KEY,
            projectId: '367075',
            fileName: 'translation.json',
          })
          .then(function (langContent) {
            if (!fs.existsSync('public/locales/' + lang.code))
              fs.promises.mkdir('public/locales/' + lang.code);
            fs.promises.writeFile(
              'public/locales/' + lang.code + '/translation.json',
              langContent,
            );
            // For printing results in CLI log
            console.log(langContent);
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
