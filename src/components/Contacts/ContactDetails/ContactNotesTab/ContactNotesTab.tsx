import React, { useCallback, useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import debounce from 'lodash/debounce';
import { useSnackbar } from 'notistack';
import {
  GetContactNotesDocument,
  useUpdateContactNotesMutation,
} from './ContactNotesTab.generated';
import ApolloClient from '../../../../lib/client';

interface Props {
  accountListId: string;
  contactId: string;
}

export const ContactNotesTab: React.FC<Props> = ({
  accountListId,
  contactId,
}) => {
  const { t } = useTranslation();

  const { enqueueSnackbar } = useSnackbar();
  const [notes, setNotes] = useState<string>('');
  const [notesSavedAt, setNotesSavedAt] = useState<string>('');

  useEffect(() => {
    (async () => {
      const fetchData = await ApolloClient.query({
        query: GetContactNotesDocument,
        variables: {
          contactId,
          accountListId,
        },
      });

      const { notes, notesSavedAt } = fetchData?.data?.contact;
      setNotes(notes ?? '');
      setNotesSavedAt(notesSavedAt ?? '');
    })();
  }, [contactId, accountListId]);

  const handleSetNotes = useCallback(
    debounce(async (notes) => {
      await updateNotes({
        variables: {
          contactId,
          accountListId,
          notes,
        },
      });
      enqueueSnackbar(t('Notes successfully saved.'), {
        variant: 'success',
        preventDuplicate: true,
      });
      setNotesSavedAt(new Date().toISOString());
    }, 1000),
    [contactId, accountListId],
  );

  const handleChange = (notes: string) => {
    setNotes(notes);
    handleSetNotes(notes);
  };

  const [updateNotes] = useUpdateContactNotesMutation();

  return (
    <>
      <TextField
        value={notes}
        onChange={(event) => handleChange(event.target.value)}
        fullWidth
        multiline
        placeholder={t('Add contact notes')}
        rows="10"
        variant="outlined"
      />
      <p style={{ textAlign: 'right' }}>
        {t('Last saved ')}
        {notesSavedAt && DateTime.fromISO(notesSavedAt).toRelative()}
      </p>
    </>
  );
};
