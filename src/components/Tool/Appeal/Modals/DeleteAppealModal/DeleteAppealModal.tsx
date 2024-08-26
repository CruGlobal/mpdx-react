import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import {
  Alert,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  ActionButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import {
  AppealsContext,
  AppealsType,
} from '../../AppealsContext/AppealsContext';
import { useDeleteAppealMutation } from './DeleteAppeal.generated';

interface DeleteAppealModalProps {
  handleClose: () => void;
}

export const DeleteAppealModal: React.FC<DeleteAppealModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();
  const { push } = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteAppeal] = useDeleteAppealMutation();
  const { accountListId, appealId } = useContext(AppealsContext) as AppealsType;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!accountListId) {
      enqueueSnackbar(t('"accountListId" is not defined'), {
        variant: 'error',
      });
      return;
    }
    if (!appealId) {
      enqueueSnackbar(t('"appealId" is not defined'), {
        variant: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    await deleteAppeal({
      variables: {
        input: {
          accountListId: accountListId,
          id: appealId,
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully deleted appeal.'), {
          variant: 'success',
        });

        push(`/accountLists/${accountListId}/tools/appeals`);
      },
      onError: () => {
        enqueueSnackbar(t('There was an error trying to delete the appeal.'), {
          variant: 'error',
        });
      },
    });

    setIsSubmitting(false);
  };

  return (
    <Modal title={t('Delete Appeal')} isOpen={true} handleClose={handleClose}>
      <DialogContent data-testid="deleteAppealModal">
        <Grid item>
          <Alert severity="warning">
            <Typography>
              {t(
                'You are about to permanently delete this Appeal. This will remove all contacts, and delete all pledges, and progress towards this appeal. Are you sure you want to continue?',
              )}
            </Typography>
          </Alert>
        </Grid>
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} />

        <ActionButton
          disabled={isSubmitting}
          onClick={handleDelete}
          color="error"
        >
          {t('Delete Appeal')}
        </ActionButton>
      </DialogActions>
    </Modal>
  );
};
