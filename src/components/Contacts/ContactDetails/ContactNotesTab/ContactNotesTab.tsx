import React, { useCallback, useEffect } from 'react';
import { TextField } from '@mui/material';
import { debounce } from 'lodash';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../ContactDetailContext';
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

  const { enqueueSnackbar } = useSnackbar();

  const { data } = useGetContactNotesQuery({
    variables: {
      contactId,
      accountListId,
    },
  });
  const { notes, setNotes } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  useEffect(() => {
    setNotes(data?.contact.notes ?? '');
  }, [data?.contact.notes]);

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
    }, 500),
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
        {t('Last updated ')}
        {data?.contact.notesSavedAt &&
          DateTime.fromISO(data.contact.notesSavedAt).toRelative()}
      </p>
    </>
  );
};
