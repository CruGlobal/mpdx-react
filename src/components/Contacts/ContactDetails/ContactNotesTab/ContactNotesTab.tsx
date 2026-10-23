import React, { useCallback, useEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { debounce } from 'lodash';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useIsOnline } from 'src/hooks/useIsOnline';
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

  const isOnline = useIsOnline();
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  const pendingNotes = useRef<string | null>(null);

  const saveNotes = useCallback(async () => {
    if (pendingNotes.current === null || !isOnlineRef.current) {
      return;
    }
    const notes = pendingNotes.current;
    pendingNotes.current = null;
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
  }, [contactId, accountListId]);

  const handleSetNotes = useCallback(debounce(saveNotes, 500), [saveNotes]);

  // Save notes that were typed while offline once the connection returns
  useEffect(() => {
    if (isOnline) {
      saveNotes();
    }
  }, [isOnline]);

  const handleChange = (notes: string) => {
    setNotes(notes);
    pendingNotes.current = notes;
    handleSetNotes();
  };

  const [updateNotes] = useUpdateContactNotesMutation();

  return (
    <>
      <TextField
        value={notes}
        onChange={(event) => handleChange(event.target.value)}
        disabled={!isOnline}
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
