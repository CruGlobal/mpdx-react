import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useUpdateAssistantSettingsMutation } from 'src/components/Assistant/AssistantSettings.generated';
import {
  DeletedConversationCounts,
  deleteAssistantConversations,
} from 'src/components/Assistant/deleteAssistantConversations';
import { useAssistantToken } from 'src/components/Assistant/useAssistantToken';
import Modal from 'src/components/Shared/Modal/Modal';

interface AssistantOptOutDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AssistantOptOutDialog: React.FC<AssistantOptOutDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const token = useAssistantToken();
  const [updateAssistantSettings] = useUpdateAssistantSettingsMutation();
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState<DeletedConversationCounts | null>(
    null,
  );

  const handleClose = () => {
    if (deleting) {
      return;
    }
    setDeleted(null);
    onClose();
  };

  const turnOff = async () => {
    setDeleting(true);
    try {
      if (!token) {
        throw new Error('No assistant token');
      }
      // Delete first so a failed deletion leaves the Assistant on and the user can retry
      const counts = await deleteAssistantConversations(token);
      setDeleted(counts);
      await updateAssistantSettings({
        variables: { attributes: { enabled: false } },
      });
    } catch {
      enqueueSnackbar(
        t('Turning off the Assistant failed. Please try again.'),
        {
          variant: 'error',
        },
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      title={t('Turn off the Assistant?')}
      handleClose={handleClose}
    >
      <DialogContent dividers>
        {deleting ? (
          <Box textAlign="center">
            <CircularProgress aria-label={t('Deleting')} />
          </Box>
        ) : deleted ? (
          <>
            <DialogContentText>
              {t('Conversations deleted: {{conversations}}', {
                conversations: deleted.conversations,
              })}
            </DialogContentText>
            <DialogContentText>
              {t('Messages deleted: {{messages}}', {
                messages: deleted.messages,
              })}
            </DialogContentText>
          </>
        ) : (
          <DialogContentText>
            {t(
              'This deletes all of your Assistant conversations right away. The permanent audit log is not deleted. You can turn the Assistant back on later.',
            )}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        {deleted ? (
          <Button onClick={handleClose}>{t('Done')}</Button>
        ) : (
          <>
            <Button color="inherit" disabled={deleting} onClick={handleClose}>
              {t('Cancel')}
            </Button>
            <Button
              color="error"
              variant="contained"
              disabled={deleting}
              onClick={turnOff}
            >
              {t('Turn off and delete')}
            </Button>
          </>
        )}
      </DialogActions>
    </Modal>
  );
};
