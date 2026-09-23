import { FilterOptionsState, createFilterOptions } from '@mui/material';

/** A MUI `filterOptions` that matches each word of the input separately, in any order. */
export const filterOptionsByWords = <T>(
  options: T[],
  state: FilterOptionsState<T>,
): T[] => {
  const filter = createFilterOptions<T>();

  // Split on punctuation too, so "John, Smith" matches the label "Smith, John".
  return state.inputValue
    .split(/[\s,-]+/)
    .filter(Boolean)
    .reduce(
      (remaining, word) => filter(remaining, { ...state, inputValue: word }),
      options,
    );
};
