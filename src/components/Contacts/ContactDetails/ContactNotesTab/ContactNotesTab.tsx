import React from 'react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { DebounceInput } from 'react-debounce-input';
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
    <>
      <DebounceInput
        debounceTimeout={500}
        value={data?.contact.notes ?? ''}
        onChange={(event) =>
          updateNotes({
            variables: {
              contactId,
              accountListId,
              notes: event.target.value,
            },
          })
        }
        element={TextField}
        fullWidth
        multiline
        placeholder={t('Add contact notes')}
        rows="10"
        variant="outlined"
        disabled={loading}
      />
      <p style={{ textAlign: 'right' }}>
        Last updated{' '}
        {data?.contact.notesSavedAt &&
          DateTime.fromISO(data.contact.notesSavedAt).toRelative()}
      </p>
    </>
  );
};
