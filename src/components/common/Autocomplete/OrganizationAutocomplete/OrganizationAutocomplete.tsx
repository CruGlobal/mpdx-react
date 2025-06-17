import { Autocomplete, AutocompleteProps, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { OrganizationsQuery } from 'pages/accountLists/[accountListId]/settings/organizations.generated';
import { GetOrganizationsQuery } from 'src/components/Settings/integrations/Organization/Organizations.generated';
import { Organization, Organizations } from 'src/graphql/types.generated';

// Create a union type that can handle both organization types
type OrganizationType = Organization | Organizations;
type OrganizationsArray =
  | OrganizationsQuery['getOrganizations']['organizations']
  | GetOrganizationsQuery['organizations'];

interface OrganizationAutocompleteProps
  extends Partial<AutocompleteProps<OrganizationType, false, boolean, false>> {
  organizations: OrganizationsArray;
  textFieldLabel?: string;
  textFieldFocusRef?: (instance: HTMLInputElement | null) => void;
}

export const OrganizationAutocomplete = ({
  organizations,
  textFieldLabel,
  textFieldFocusRef,
  ...props
}: OrganizationAutocompleteProps) => {
  const { t } = useTranslation();

  return (
    <Autocomplete
      {...props}
      options={
        organizations?.filter((org): org is OrganizationType => !!org) || []
      }
      getOptionLabel={(org) => org.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={textFieldLabel ?? t('Organization')}
          inputRef={textFieldFocusRef}
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
};
