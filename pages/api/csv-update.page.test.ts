import { camelToSnake } from './csv-update.page';

jest.mock('next-auth/jwt', () => ({ getToken: jest.fn() }));
jest.mock('node-fetch', () => ({}));

describe('CSV Update Page', () => {
  describe('camelToSnake()', () => {
    it('should return a map with the keys swapped from camel case to snake case', () => {
      const initialMap = {
        keyOne: 'valueOne',
        keyTwo: 'valueTwo',
      };

      const expectedMap = {
        key_one: 'valueOne',
        key_two: 'valueTwo',
      };

      const snakeMap = camelToSnake(initialMap);
      expect(snakeMap).toEqual(expectedMap);
    });
  });
});
