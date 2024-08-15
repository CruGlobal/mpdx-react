import React from 'react';
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
import { PledgeInfo } from '../../List/ContactRow/ContactRow';
import { useDeleteAccountListPledgeMutation } from './DeletePledge.generated';

const LoadingIndicator = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 1, 0, 0),
}));

interface DeletePledgeModalProps {
  handleClose: () => void;
  pledge: PledgeInfo;
}

export const DeletePledgeModal: React.FC<DeletePledgeModalProps> = ({
  pledge,
  handleClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteAccountListPledge] = useDeleteAccountListPledgeMutation();
  const [mutating, setMutating] = React.useState(false);
  const { contactsQueryResult } = React.useContext(
    AppealsContext,
  ) as AppealsType;

  const handleConfirm = async () => {
    setMutating(true);
    await deleteAccountListPledge({
      variables: {
        input: {
          id: pledge.id ?? '',
        },
      },
      update: () => {
        contactsQueryResult.refetch();
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully removed commitment from appeal'), {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar(t('Unable to remove commitment from appeal'), {
          variant: 'error',
        });
      },
    });
    setMutating(false);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Remove Commitment')}
      handleClose={handleClose}
    >
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <DialogContentText component="div">
            {t('Are you sure you wish to remove this commitment?')}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={mutating}>
          {t('No')}
        </CancelButton>
        <SubmitButton type="button" onClick={handleConfirm} disabled={mutating}>
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
