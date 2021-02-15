// import onesky from '@brainly/onesky-utils';
const fs = require('fs');
const onesky = require('@brainly/onesky-utils');

const options = {
  secret: process.env.ONESKY_API_SECRET,
  apiKey: process.env.ONESKY_API_KEY,
  projectId: '367075',
};

interface OneSkyLanguage {
  code: string;
  translation_progress: string;
}

interface OneSkyFile {
  file_name: string;
  string_count: number;
}

const getLanguages = async (): Promise<OneSkyLanguage[]> => {
  const { data: languages }: { data: OneSkyLanguage[] } = JSON.parse(
    await onesky.getLanguages(options),
  );
  return languages.filter(
    ({ code, translation_progress }) =>
      parseFloat(translation_progress) > 0 && code !== 'en',
  );
};

const getFiles = async (): Promise<OneSkyFile[]> => {
  const { data: files }: { data: OneSkyFile[] } = JSON.parse(
    await onesky.getFiles(options),
  );
  return files.filter(
    ({ string_count, file_name }) =>
      string_count > 0 && file_name !== 'Manually input',
  );
};

const store = async (language: string, fileName: string): Promise<void> => {
  const content = await onesky.getFile({ ...options, language, fileName });
  if (!fs.existsSync(`public/locales/${language}`))
    await fs.promises.mkdir(`public/locales/${language}`);
  await fs.promises.writeFile(
    `public/locales/${language}/${fileName}`,
    content,
  );
};

const download = async (): Promise<void> => {
  const languages = await getLanguages();
  const files = await getFiles();
  console.log(languages, files);
  languages.forEach(({ code }) => {
    files.forEach(({ file_name }) => {
      store(code, file_name);
    });
  });
};

download();

export {};
