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

  // Keep the field in sync with the query until the user edits it, so the
  // network result replaces stale cached notes. After an edit, a save's response
  // also updates the notes and would otherwise replace text typed while it was
  // in flight.
  const editedContactId = useRef<string | null>(null);
  useEffect(() => {
    editedContactId.current = null;
  }, [contactId]);
  useEffect(() => {
    if (editedContactId.current === contactId) {
      return;
    }
    setNotes(data?.contact.notes ?? '');
  }, [contactId, data]);

  const isOnline = useIsOnline();
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;
  // Unsaved notes keyed by contact, each with the account list it was typed in,
  // so text is never saved onto a different contact than it was typed for
  const pendingNotes = useRef(
    new Map<string, { accountListId: string; notes: string }>(),
  );

  // Run one save at a time so an older save's response can't land after a
  // newer one and leave the older notes in the cache
  const saveQueue = useRef(Promise.resolve());

  const saveNotes = useCallback(() => {
    saveQueue.current = saveQueue.current.then(async () => {
      if (!isOnlineRef.current) {
        return;
      }
      const entries = [...pendingNotes.current];
      pendingNotes.current.clear();
      await Promise.all(
        entries.map(async ([contactId, entry]) => {
          try {
            await updateNotes({
              variables: {
                contactId,
                accountListId: entry.accountListId,
                notes: entry.notes,
              },
            });
            enqueueSnackbar(t('Notes successfully saved.'), {
              variant: 'success',
              preventDuplicate: true,
            });
          } catch {
            // Keep the text so it is retried, unless newer text was typed
            if (!pendingNotes.current.has(contactId)) {
              pendingNotes.current.set(contactId, entry);
            }
          }
        }),
      );
    });
    return saveQueue.current;
  }, []);

  const handleSetNotes = useCallback(debounce(saveNotes, 500), [saveNotes]);

  // Save notes that were typed while offline once the connection returns
  useEffect(() => {
    if (isOnline && pendingNotes.current.size) {
      saveNotes();
    }
  }, [isOnline]);

  const handleChange = (notes: string) => {
    editedContactId.current = contactId;
    setNotes(notes);
    pendingNotes.current.set(contactId, { accountListId, notes });
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
