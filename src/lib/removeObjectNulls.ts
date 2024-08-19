import { curry, pickBy } from 'lodash/fp';

export default curry((collection: object) =>
  pickBy((val) => val !== null, collection),
);
