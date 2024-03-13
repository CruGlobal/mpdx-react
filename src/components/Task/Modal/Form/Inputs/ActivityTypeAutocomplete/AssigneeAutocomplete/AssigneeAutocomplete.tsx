import { Autocomplete, CircularProgress, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssigneeOptionsQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';

interface AssigneeAutocompleteProps {
  accountListId: string;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
}

export const AssigneeAutocomplete: React.FC<AssigneeAutocompleteProps> = ({
  accountListId,
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useAssigneeOptionsQuery({
    variables: {
      accountListId,
    },
  });
  const users = data?.accountListUsers?.nodes ?? [];

  return (
    <Autocomplete
      autoSelect
      autoHighlight
      options={users.map(({ user }) => user.id)}
      getOptionLabel={(userId) => {
        const user = users.find(({ user }) => user.id === userId)?.user;
        return user ? `${user.firstName} ${user.lastName}` : '';
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('Assignee')}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="primary" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      value={value}
      onChange={(_, value) => onChange(value)}
    />
  );
};
