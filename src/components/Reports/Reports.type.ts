export type Unarray<T> = T extends Array<infer U> ? U : T;
export type Order = 'asc' | 'desc';
