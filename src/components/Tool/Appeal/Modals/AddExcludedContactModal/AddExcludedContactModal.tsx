import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { useAppealQuery } from '../AddContactToAppealModal/appealInfo.generated';
import { useAssignContactsToAppealMutation } from './AddExcludedContactModal.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

export interface AddExcludedContactModalProps {
  contactId: string;
  handleClose: () => void;
}

export const AddExcludedContactModal: React.FC<
  AddExcludedContactModalProps
> = ({ contactId, handleClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [assignContactsToAppeal] = useAssignContactsToAppealMutation();
  const { accountListId, appealId, contactsQueryResult } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const [mutating, setMutating] = useState(false);

  const { data, loading } = useAppealQuery({
    variables: {
      accountListId: accountListId ?? '',
      appealId: appealId ?? '',
    },
  });

  const existingContactIds = data?.appeal?.contactIds ?? [];

  const handleConfirm = async () => {
    setMutating(true);
    // TODO Check this is working. It wasn't currently as the backend doesn't remove the user from the excluded list and returns an error.
    await assignContactsToAppeal({
      variables: {
        input: {
          accountListId: accountListId ?? '',
          attributes: {
            id: appealId,
            contactIds: [...existingContactIds, contactId],
          },
        },
      },
      update: () => {
        contactsQueryResult.refetch();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully added contact to appeal'), {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(t('Failed to add contact to appeal'), {
          variant: 'error',
        });
      },
    });
    setMutating(false);
  };

  return (
    <Modal isOpen={true} title={t('Add Contact')} handleClose={handleClose}>
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <DialogContentText component="div">
            {t(
              'Are you sure you wish to add this excluded contact to the appeal?',
            )}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={mutating || loading}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={handleConfirm}
          disabled={mutating || loading}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
