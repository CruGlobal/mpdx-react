import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Modal from '../../../common/Modal/Modal';
import {
  useMassActionsMergeMutation,
  useGetContactsForMergingQuery,
} from './MassActionsMerge.generated';
import theme from 'src/theme';
import { DateTime } from 'luxon';
import { getLocalizedContactStatus } from 'src/utils/functions/getLocalizedContactStatus';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface MassActionsMergeModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

export const MassActionsMergeModal: React.FC<MassActionsMergeModalProps> = ({
  handleClose,
  accountListId,
  ids,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [primaryContactId, setPrimaryContactId] = useState(ids[0]);

  const [contactsMerge, { loading: updating }] = useMassActionsMergeMutation();

  const { data, loading } = useGetContactsForMergingQuery({
    variables: {
      accountListId,
      contactIds: ids,
    },
  });

  const mergeContacts = async () => {
    const loserContactIds = ids.filter((id) => id !== primaryContactId);
    await contactsMerge({
      variables: {
        loserContactIds,
        winnerContactId: primaryContactId,
      },
      update: (cache) => {
        // Delete the loser contacts and remove dangling references to them
        loserContactIds.forEach((id) => {
          cache.evict({ id: `Contact:${id}` });
        });
        cache.gc();
      },
    });
    enqueueSnackbar(t('Contacts merged!'), {
      variant: 'success',
    });
    handleClose();
  };

  return (
    <Modal title={t('Merge Contacts')} isOpen={true} handleClose={handleClose}>
      <DialogContent>
        <Alert
          severity="warning"
          sx={(theme) => ({
            marginBottom: theme.spacing(2),
          })}
        >
          {t('This action cannot be undone!')}
        </Alert>
        <Typography variant="subtitle1">
          {t('Are you sure you want to merge the selected contacts?')}
        </Typography>
        <Typography variant="subtitle1">
          {t(
            ' Data from the "losers" will get copied to the "winner". Select the winner below. No data will be lost by merging.',
          )}
        </Typography>
        {data?.contacts.nodes.map((contact) => (
          <Box
            my={2}
            p={2}
            key={contact.id}
            onClick={() => setPrimaryContactId(contact.id)}
            aria-selected={primaryContactId === contact.id}
            sx={(theme) => ({
              display: 'flex',
              gap: theme.spacing(2),
              cursor: 'pointer',
              borderWidth: 3,
              borderStyle: 'solid',
              borderColor:
                primaryContactId === contact.id
                  ? theme.palette.mpdxGreen.main
                  : theme.palette.cruGrayLight.main,
            })}
            data-testid="MassActionsMergeModalContact"
          >
            <Avatar
              src={contact.avatar}
              alt={`${contact.name} avatar}`}
              style={{
                width: theme.spacing(6),
                height: theme.spacing(6),
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1">{contact.name}</Typography>
              <Typography variant="subtitle2">
                {t('Status')}: {getLocalizedContactStatus(t, contact.status)}
                <br />
                {contact.primaryAddress && (
                  <>
                    {contact.primaryAddress.street}
                    <br />
                    {contact.primaryAddress.city},{' '}
                    {contact.primaryAddress.state}{' '}
                    {contact.primaryAddress.postalCode}
                    <br />
                    {t('From')}: {contact.primaryAddress.source}
                    <br />
                  </>
                )}
                {t('On')}:{' '}
                {DateTime.fromISO(contact.createdAt).toLocaleString(
                  DateTime.DATE_SHORT,
                )}
              </Typography>
            </Box>
            {primaryContactId === contact.id && (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  sx={(theme) => ({
                    backgroundColor: theme.palette.mpdxGreen.main,
                    color: 'white',
                    padding: theme.spacing(0.5),
                    margin: theme.spacing(-2),
                  })}
                  variant="subtitle2"
                >
                  {t('Use This One')}
                </Typography>
                <Box sx={{ flex: 1 }} />
              </Box>
            )}
          </Box>
        )) ?? <LoadingIndicator size={20} />}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={loading || updating} />
        <SubmitButton onClick={mergeContacts} disabled={loading || updating}>
          {updating && <CircularProgress color="primary" size={20} />}
          {t('Merge')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
