import { ReactElement } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { useGetAppealsForMassActionQuery } from 'src/components/Contacts/MassActions/AddToAppeal/GetAppealsForMassAction.generated';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';

type Appeal = any;
interface AppealAutocompleteProps
  extends Partial<AutocompleteProps<Appeal, boolean, boolean, false>> {
  TextFieldProps?: Partial<TextFieldProps>;
  accountListId: string;
}

export const AppealAutocomplete = ({
  TextFieldProps,
  accountListId,
  ...props
}: AppealAutocompleteProps) => {
  const {
    data: appeals,
    error,
    fetchMore,
  } = useGetAppealsForMassActionQuery({
    variables: {
      accountListId,
    },
  });
  const { loading: loadingAppeals } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: appeals?.appeals.pageInfo,
  });

  return (
    <Autocomplete
      {...props}
      autoSelect
      autoHighlight
      options={appeals?.appeals.nodes.map((appeal) => appeal.id) || []}
      getOptionLabel={(appealId): string => {
        const currentAppeal = appeals?.appeals?.nodes.find(
          (appeal) => appeal.id === appealId,
        )?.name;
        return currentAppeal ?? '';
      }}
      isOptionEqualToValue={(option, value): boolean => option === value}
      renderInput={(params): ReactElement => (
        <TextField
          {...params}
          {...TextFieldProps}
          data-testid="appealTextInput"
          InputProps={{
            ...params.InputProps,
            'aria-labelledby': 'appeal-label',
            endAdornment: (
              <>
                {loadingAppeals && (
                  <CircularProgress color="primary" size={20} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
