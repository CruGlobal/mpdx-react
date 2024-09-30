import { IdValue } from 'src/graphql/types.generated';

export const languages: IdValue[] = [
  {
    id: 'en-us',
    value: 'American English',
  },
  {
    id: 'ar',
    value: 'Arabic (العربية)',
  },
  {
    id: 'hy',
    value: 'Armenian (հայերեն)',
  },
  {
    id: 'my',
    value: 'Burmese (မြန်မာ)',
  },
  {
    id: 'zh-hans-cn',
    value: 'Chinese (中文)',
  },
  {
    id: 'fr-ca',
    value: 'Canadian French (français canadien)',
  },
  {
    id: 'nl-nl',
    value: 'Dutch (Nederlands)',
  },
  {
    id: 'fr-fr',
    value: 'French (français)',
  },
  {
    id: 'de',
    value: 'German (Deutsch)',
  },
  {
    id: 'de-ch',
    value: 'Swiss High German (Schweizer Hochdeutsch)',
  },
  {
    id: 'id',
    value: 'Indonesian (Indonesia)',
  },
  {
    id: 'it',
    value: 'Italian (italiano)',
  },
  {
    id: 'ko',
    value: 'Korean (한국어)',
  },
  {
    id: 'pl',
    value: 'Polish (polski)',
  },
  {
    id: 'pt-br',
    value: 'Portuguese (português)',
  },
  {
    id: 'ro',
    value: 'Romanian (Română)',
  },
  {
    id: 'ru',
    value: 'Russian (русский)',
  },
  {
    id: 'es-419',
    value: 'Latin American Spanish (español latinoamericano)',
  },
  {
    id: 'th',
    value: 'Thai (ไทย)',
  },
  {
    id: 'tr',
    value: 'Turkish (Türkçe)',
  },
  {
    id: 'uk',
    value: 'Ukrainian (українська)',
  },
  {
    id: 'vi',
    value: 'Vietnamese (Tiếng Việt)',
  },
];

export const formatLanguage = (
  language: string | undefined | null,
  languagesList: IdValue[] = languages,
): string => {
  const name = languagesList.find(({ id }) => id === language)?.value;
  return name ?? '';
};
