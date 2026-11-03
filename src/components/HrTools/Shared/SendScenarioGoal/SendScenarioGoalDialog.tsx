import React, { useState } from 'react';
import { Box, DialogActions, DialogContent, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/LoadingStyling';
import { StyledDialogContentText } from 'src/components/Shared/styledComponents/StyledDialogContentText';
import {
  SendableScenarioGoal,
  isValidEmailAddress,
  normalizeEmailAddress,
} from './sendScenarioGoalHelpers';

export interface SendScenarioGoalDialogProps {
  isOpen: boolean;
  /** Kept set through the close transition so the dialog doesn't flash empty. */
  goal: SendableScenarioGoal | null;
  /** Changes on every request so reopening the same goal starts a fresh form. */
  requestId: number;
  /** A rejection keeps the dialog open; the global Apollo error link already toasts it. */
  onSend: (emailAddress: string) => Promise<unknown>;
  handleClose: () => void;
}

interface SendScenarioGoalFormProps {
  goal: SendableScenarioGoal;
  onSend: SendScenarioGoalDialogProps['onSend'];
  handleClose: () => void;
  sending: boolean;
  setSending: (sending: boolean) => void;
}

// Keyed by request so each opening starts with no address.
const SendScenarioGoalForm: React.FC<SendScenarioGoalFormProps> = ({
  goal,
  onSend,
  handleClose,
  sending,
  setSending,
}) => {
  const { t } = useTranslation();
  const [emailAddress, setEmailAddress] = useState('');
  // Checked only after blur or a send attempt, so a half-typed address isn't flagged mid-keystroke.
  const [touched, setTouched] = useState(false);

  const recipient = normalizeEmailAddress(emailAddress);
  const invalid = touched && !!recipient && !isValidEmailAddress(recipient);

  const name =
    [goal.firstName, goal.lastName].filter(Boolean).join(' ') ||
    t('this scenario goal');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!isValidEmailAddress(recipient)) {
      return;
    }

    setSending(true);
    onSend(recipient).then(
      () => {
        setSending(false);
        handleClose();
      },
      () => setSending(false),
    );
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <DialogContent dividers>
        {sending ? (
          <Box textAlign="center">
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <>
            <StyledDialogContentText>
              {t(
                'Email the support goals worksheet for {{name}} to this address. This cannot be undone.',
                { name },
              )}
            </StyledDialogContentText>
            <TextField
              type="email"
              label={t('Email address')}
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              onBlur={() => setTouched(true)}
              required
              fullWidth
              error={invalid}
              helperText={invalid ? t('Enter a valid email address.') : ' '}
              autoFocus
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={sending}>
          {t('Cancel')}
        </CancelButton>
        <SubmitButton
          type="submit"
          variant="contained"
          disabled={sending || invalid || !recipient}
        >
          {t('Send Worksheet')}
        </SubmitButton>
      </DialogActions>
    </form>
  );
};

/** Collects the address a scenario goal's worksheet is emailed to. */
export const SendScenarioGoalDialog: React.FC<SendScenarioGoalDialogProps> = ({
  isOpen,
  goal,
  requestId,
  onSend,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  // The close icon and backdrop would otherwise dismiss the dialog mid-send.
  const guardedClose = () => {
    if (!sending) {
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t('Email Support Goals Worksheet')}
      handleClose={guardedClose}
    >
      {goal && (
        <SendScenarioGoalForm
          key={requestId}
          goal={goal}
          onSend={onSend}
          handleClose={handleClose}
          sending={sending}
          setSending={setSending}
        />
      )}
    </Modal>
  );
};
