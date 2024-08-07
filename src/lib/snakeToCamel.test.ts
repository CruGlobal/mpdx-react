import { camelToSnake, camelToSnakeObject, snakeToCamel } from './snakeToCamel';

describe('snakeToCamel util', () => {
  describe('camelToSnake', () => {
    it('should turn a camel case key to a snake case key', () => {
      const initialValue = 'camelCaseKey';
      expect(camelToSnake(initialValue)).toEqual('camel_case_key');
    });
  });

  describe('camelToSnakeObject()', () => {
    it('should return a map with the keys swapped from camel case to snake case', () => {
      const initialMap = {
        keyOne: 'valueOne',
        keyTwo: 'valueTwo',
      };

      const expectedMap = {
        key_one: 'valueOne',
        key_two: 'valueTwo',
      };

      const snakeMap = camelToSnakeObject(initialMap);
      expect(snakeMap).toEqual(expectedMap);
    });
  });

  describe('snakeToCamel', () => {
    it('should turn a snake case key to a camel case key', () => {
      const initialValue = 'snake_case_key';
      expect(snakeToCamel(initialValue)).toEqual('snakeCaseKey');
    });
  });
});
