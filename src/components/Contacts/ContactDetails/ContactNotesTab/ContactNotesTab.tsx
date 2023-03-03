import React, { useCallback, useState } from 'react';
import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

import debounce from 'lodash/debounce';
import { useSnackbar } from 'notistack';
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
  const [localNotes, setLocalNotes] = useState<string>(notes);

  React.useEffect(() => {
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
    }, 1000),
    [],
  );

  const handleChange = (notes: string) => {
    setNotes(notes);
    handleSetNotes(notes);
  };

  const [updateNotes] = useUpdateContactNotesMutation();

  return (
    <>
      <TextField
        value={localNotes}
        onChange={(event) => {
          setLocalNotes(event.target.value);
          handleChange(event.target.value);
        }}
        fullWidth
        multiline
        placeholder={t('Add contact notes')}
        rows="10"
        variant="outlined"
      />
      <p style={{ textAlign: 'right' }}>
        {t('Last saved ')}
        {data?.contact.notesSavedAt &&
          DateTime.fromISO(data.contact.notesSavedAt).toRelative()}
      </p>
    </>
  );
};
