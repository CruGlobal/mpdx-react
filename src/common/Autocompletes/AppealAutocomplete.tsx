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

interface AppealAutocompleteProps
  extends Partial<AutocompleteProps<string, boolean, boolean, false>> {
  accountListId: string;
  TextFieldProps?: TextFieldProps;
}

export const AppealAutocomplete = ({
  TextFieldProps,
  accountListId,
  ...props
}: AppealAutocompleteProps) => {
  const { data, error, fetchMore } = useGetAppealsForMassActionQuery({
    variables: {
      accountListId,
    },
  });
  const { loading: loadingAppeals } = useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.appeals.pageInfo,
  });

  return (
    <Autocomplete
      {...props}
      autoSelect
      autoHighlight
      options={data?.appeals.nodes.map((appeal) => appeal.id) || []}
      getOptionLabel={(appealId): string => {
        const appealName = data?.appeals?.nodes.find(
          (appeal) => appeal.id === appealId,
        )?.name;
        return appealName ?? '';
      }}
      renderInput={(params): ReactElement => (
        <TextField
          {...params}
          {...TextFieldProps}
          InputProps={{
            ...params.InputProps,
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
