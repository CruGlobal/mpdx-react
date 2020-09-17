import { curry, reduce } from 'lodash/fp';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reduceObject = (reduce as any).convert({ cap: false });

export default curry((a, b, c) => reduceObject(a, b, c));
