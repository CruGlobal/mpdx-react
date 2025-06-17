import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OrganizationsQuery } from 'pages/accountLists/[accountListId]/settings/organizations.generated';
import { Organizations } from 'src/graphql/types.generated';

interface OrganizationAutocompleteProps
  extends Partial<AutocompleteProps<Organizations, false, boolean, false>> {
  organizations: OrganizationsQuery['getOrganizations']['organizations'];
  textFieldLabel?: string;
}

export const OrganizationAutocomplete = ({
  organizations,
  textFieldLabel,
  ...props
}: OrganizationAutocompleteProps) => {
  const { t } = useTranslation();

  return (
    <Autocomplete
      style={{
        width: '250px',
      }}
      {...props}
      options={
        organizations?.filter((org): org is Organizations => !!org) || []
      }
      getOptionLabel={(org) => org.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={textFieldLabel ?? t('Organization')}
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
};
