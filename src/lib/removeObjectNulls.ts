const pickBy = (predicate, collection) => {
  return Object.keys(collection).reduce((result, key) => {
    if (predicate(collection[key])) {
      result[key] = collection[key];
    }
    return result;
  }, {});
};

const filterNullValues = (collection) =>
  collection ? pickBy((val) => val !== null, collection) : {};

export default filterNullValues;
// Usage example:
// import filterNullValues from './lib/removeObjectNulls';
// const data = { a: 1, b: null, c: 3, d: null };
// const result = filterNullValues(data);
// console.log(result);
// Output: { a: 1, c: 3 }
