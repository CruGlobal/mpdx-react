import { Autocomplete, TextField } from '@mui/material';
import { MultiselectFilter } from 'src/graphql/types.generated';

interface MultiselectAutocompleteProps {
  filter: MultiselectFilter;
  selected?: Array<string>;
  toggleValue: (value?: Array<string>) => void;
  filterTitle: string | undefined;
  reverseSelected?: boolean;
  groupBy?: (option: string) => string;
  options: string[];
}
export const MultiselectFilterAutocomplete: React.FC<
  MultiselectAutocompleteProps
> = ({
  filter,
  selected,
  toggleValue,
  filterTitle,
  reverseSelected,
  groupBy,
  options,
}: MultiselectAutocompleteProps) => {
  return (
    <Autocomplete
      multiple
      autoHighlight
      autoSelect
      value={selected || []}
      onChange={(_, value) => toggleValue(value)}
      options={options}
      getOptionLabel={(option) =>
        filter.options?.find(({ value }) => String(value) === String(option))
          ?.name ?? ''
      }
      groupBy={groupBy}
      ChipProps={{
        color: reverseSelected ? 'error' : 'default',
        style: {
          background: reverseSelected ? '#d32f2f' : '#ffffff',
        },
      }}
      filterSelectedOptions
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={filterTitle}
          label={filterTitle}
          data-testid="multiSelectFilter"
        />
      )}
    />
  );
};
