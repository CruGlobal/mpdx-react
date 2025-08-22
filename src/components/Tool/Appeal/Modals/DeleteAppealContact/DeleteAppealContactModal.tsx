import React from 'react';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/styledComponents';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import {
  AppealsContext,
  AppealsType,
  TableViewModeEnum,
} from '../../AppealsContext/AppealsContext';
import { useDeleteAppealContactMutation } from './DeleteAppealContact.generated';

export interface DeleteAppealContactModalProps {
  contactId: string;
  handleClose: () => void;
}

export const DeleteAppealContactModal: React.FC<
  DeleteAppealContactModalProps
> = ({ contactId, handleClose }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appealId, viewMode } = React.useContext(
    AppealsContext,
  ) as AppealsType;
  const [deleteAppealContact, { loading: mutating }] =
    useDeleteAppealContactMutation();

  const handleRemoveContact = async () => {
    if (!appealId) {
      enqueueSnackbar('Error while removing contact from appeal.', {
        variant: 'error',
      });
      return;
    }
    await deleteAppealContact({
      variables: {
        input: {
          contactId,
          appealId,
        },
      },
      update: (cache) => {
        cache.evict({ id: `Contact:${contactId}` });
      },
      onCompleted: () => {
        enqueueSnackbar('Successfully remove contact from appeal.', {
          variant: 'success',
        });
        handleClose();
      },
      onError: () => {
        enqueueSnackbar('Error while removing contact from appeal.', {
          variant: 'error',
        });
      },
    });
  };

  const onClickDecline = () => {
    handleClose();
  };

  return (
    <Modal isOpen={true} title={t('Remove Contact')} handleClose={handleClose}>
      <DialogContent dividers>
        {mutating ? (
          <Box style={{ textAlign: 'center' }}>
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <DialogContentText component="div">
            {t(
              viewMode === TableViewModeEnum.Flows
                ? 'You cannot exclude a contact from this appeal. Would you like to remove them from this appeal instead?'
                : 'Are you sure you wish to remove this contact from the appeal?',
            )}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={onClickDecline} disabled={mutating}>
          {t('No')}
        </CancelButton>
        <SubmitButton
          type="button"
          onClick={handleRemoveContact}
          disabled={mutating}
        >
          {t('Yes')}
        </SubmitButton>
      </DialogActions>
    </Modal>
  );
};
