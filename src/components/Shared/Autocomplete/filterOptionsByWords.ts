import { FilterOptionsState, createFilterOptions } from '@mui/material';

/** A MUI `filterOptions` that matches each word of the input separately, in any order. */
export const filterOptionsByWords = <T>(
  options: T[],
  state: FilterOptionsState<T>,
): T[] => {
  const filter = createFilterOptions<T>();

  // Split on the same characters as the API's wildcardSearch filter, so this never hides a
  // result the server matched.
  return state.inputValue
    .split(/[\s,-]+/)
    .filter(Boolean)
    .reduce(
      (remaining, word) => filter(remaining, { ...state, inputValue: word }),
      options,
    );
};
