import { filterOptionsByWords } from './filterOptionsByWords';

const names = [
  'Smith, John',
  'Jones, Freddie',
  'Min jun, Park',
  'Núñez, Maria',
];

const filter = (inputValue: string, options = names) =>
  filterOptionsByWords(options, {
    inputValue,
    getOptionLabel: (option) => option,
  });

describe('filterOptionsByWords', () => {
  it('matches words in any order', () => {
    expect(filter('John Smith')).toEqual(['Smith, John']);
  });

  it('matches a single word', () => {
    expect(filter('smith')).toEqual(['Smith, John']);
  });

  it('requires every word to match', () => {
    expect(filter('John Doe')).toEqual([]);
  });

  it('splits the input on commas', () => {
    expect(filter('jones,freddie')).toEqual(['Jones, Freddie']);
  });

  it('splits the input on hyphens', () => {
    expect(filter('min-jun park')).toEqual(['Min jun, Park']);
  });

  it('ignores case and accents', () => {
    expect(filter('nunez maria')).toEqual(['Núñez, Maria']);
  });

  it('returns every option when the input holds no words', () => {
    expect(filter('')).toEqual(names);
    expect(filter(' , - ')).toEqual(names);
  });
});
