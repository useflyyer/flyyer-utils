export type Maybe<T> = T | null | undefined;

export type MaybeRecord<T> = {
  [P in keyof T]: Maybe<T[P]>;
};

export type MaybePartial<T> = Maybe<MaybeRecord<T>>;
