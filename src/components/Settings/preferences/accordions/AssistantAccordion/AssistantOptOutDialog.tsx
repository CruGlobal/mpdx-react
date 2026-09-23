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
import {
  AssistantTokenState,
  useAssistantToken,
} from 'src/components/Assistant/useAssistantToken';
import Modal from 'src/components/Shared/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';

interface CannotDeleteProps {
  tokenState: AssistantTokenState;
  onRetry: () => void;
}

const CannotDelete: React.FC<CannotDeleteProps> = ({ tokenState, onRetry }) => {
  const { t } = useTranslation();
  const appName = getAppName();
  const canRetry = tokenState.status === 'failed' && tokenState.retryable;

  return (
    <>
      <DialogContentText>
        {t(
          'Your conversations could not be deleted right now, so the Assistant is still on.',
        )}
      </DialogContentText>
      {canRetry ? (
        <Button onClick={onRetry}>{t('Try again')}</Button>
      ) : (
        <DialogContentText>
          {tokenState.status === 'refusing' &&
          tokenState.reason === 'notTurnedOn'
            ? t('Turn on "Help me use {{appName}}" first, then try again.', {
                appName,
              })
            : t('Please try again later.')}
        </DialogContentText>
      )}
    </>
  );
};

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
  const accountListId = useAccountListId();
  // Mints only while open, since deleting needs a token and the rest of Preferences does not
  const {
    state: tokenState,
    token,
    refreshToken,
    retry,
  } = useAssistantToken(open ? accountListId : null);
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
      // Waits for a mint still in flight; a refusal or failure leaves the Assistant on and shows why
      const currentToken = token ?? (await refreshToken());
      if (!currentToken) {
        return;
      }
      // Delete first so nothing is left behind once the Assistant is off
      const counts = await deleteAssistantConversations(currentToken);
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

  const cannotDelete =
    tokenState.status === 'refusing' || tokenState.status === 'failed';

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
        ) : cannotDelete ? (
          <CannotDelete tokenState={tokenState} onRetry={retry} />
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
              disabled={deleting || cannotDelete}
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
