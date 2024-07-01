import { curry, reduce } from 'lodash/fp';

const reduceO = (reduce as any).convert({ cap: false });

export default curry((a, b, c) => reduceO(a, b, c));
