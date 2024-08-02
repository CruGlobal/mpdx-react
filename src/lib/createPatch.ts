import { curry, isEqual } from 'lodash/fp';
import reduceObject from './reduceObject';

export default curry((target, source) => {
  return reduceObject(
    (result, value, key) => {
      if (key === 'id') {
        result[key] = value;
      }
      if (!isEqual(value, target[key])) {
        result[key] = value;
      }
      return result;
    },
    {},
    source,
  );
});
