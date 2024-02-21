export const languages = [
  {
    id: 'en',
    value: 'American English',
  },
  {
    id: 'fr',
    value: 'French (français)',
  },
  {
    id: 'de',
    value: 'German (Deutsch)',
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
    id: 'tr',
    value: 'Turkish (Türkçe)',
  },
  {
    id: 'ro',
    value: 'Romanian (Română)',
  },
];

export const formatLanguage = (language: string): string => {
  const name = languages.find(({ id }) => id === language)?.value;
  return name ?? '';
};
