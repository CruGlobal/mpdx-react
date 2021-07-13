import React from 'react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import {
  useGetContactNotesQuery,
  useUpdateContactNotesMutation,
} from './ContactNotesTab.generated';

interface Props {
  accountListId: string;
  contactId: string;
}

export const ContactNotesTab: React.FC<Props> = ({
  accountListId,
  contactId,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useGetContactNotesQuery({
    variables: {
      contactId,
      accountListId,
    },
  });

  const [updateNotes] = useUpdateContactNotesMutation();

  return (
    <TextField
      fullWidth
      multiline
      placeholder={t('Add contact notes')}
      rows="10"
      variant="outlined"
      value={data?.contact.notes}
      disabled={loading}
      onChange={(event) =>
        updateNotes({
          variables: { contactId, accountListId, notes: event.target.value },
        })
      }
    />
  );
};
