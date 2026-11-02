import React, { useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  DialogActions,
  DialogContent,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/Shared/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/Shared/Modal/Modal';
import { LoadingIndicator } from 'src/components/Shared/styledComponents/LoadingStyling';
import { StyledDialogContentText } from 'src/components/Shared/styledComponents/StyledDialogContentText';
import {
  MAX_SCENARIO_GOAL_RECIPIENTS,
  SendableScenarioGoal,
  isValidEmailAddress,
  scenarioGoalRecipients,
  splitEmailAddresses,
} from './sendScenarioGoalHelpers';

export interface SendScenarioGoalDialogProps {
  isOpen: boolean;
  /** Kept set through the close transition so the dialog doesn't flash empty. */
  goal: SendableScenarioGoal | null;
  /** Rejections are swallowed; the global Apollo error link already toasts them. */
  onSend: (emailAddresses: string[]) => Promise<unknown>;
  handleClose: () => void;
}

const mergeAddresses = (existing: string[], added: string[]): string[] => [
  ...new Set([...existing, ...added]),
];

interface SendScenarioGoalFormProps {
  goal: SendableScenarioGoal;
  onSend: SendScenarioGoalDialogProps['onSend'];
  handleClose: () => void;
}

// Separate from the dialog so each opening starts over from the scenario's own addresses.
const SendScenarioGoalForm: React.FC<SendScenarioGoalFormProps> = ({
  goal,
  onSend,
  handleClose,
}) => {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState(() =>
    scenarioGoalRecipients(goal),
  );
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  const recipients = mergeAddresses(addresses, splitEmailAddresses(inputValue));
  const invalidAddresses = recipients.filter(
    (address) => !isValidEmailAddress(address),
  );
  const tooMany = recipients.length > MAX_SCENARIO_GOAL_RECIPIENTS;

  let helperText = t('Press Enter or type a comma after each address.');
  if (invalidAddresses.length) {
    helperText = t('Fix or remove the invalid email addresses: {{addresses}}', {
      addresses: invalidAddresses.join(', '),
    });
  } else if (tooMany) {
    helperText = t('Enter at most {{max}} email addresses.', {
      max: MAX_SCENARIO_GOAL_RECIPIENTS,
    });
  }
  const hasError = invalidAddresses.length > 0 || tooMany;

  const name =
    [goal.firstName, goal.lastName].filter(Boolean).join(' ') ||
    t('this scenario goal');

  const handleSend = () => {
    setSending(true);
    onSend(recipients)
      .catch(() => undefined)
      .finally(() => {
        setSending(false);
        handleClose();
      });
  };

  return (
    <>
      <DialogContent dividers>
        {sending ? (
          <Box textAlign="center">
            <LoadingIndicator color="primary" size={50} />
          </Box>
        ) : (
          <>
            <StyledDialogContentText>
              {t(
                'Email the support goals worksheet for {{name}} to these addresses. This cannot be undone.',
                { name },
              )}
            </StyledDialogContentText>
            <Autocomplete
              multiple
              freeSolo
              autoSelect
              options={[]}
              value={addresses}
              inputValue={inputValue}
              onChange={(_event, newValue) => {
                setAddresses(
                  mergeAddresses([], newValue.flatMap(splitEmailAddresses)),
                );
              }}
              onInputChange={(_event, newInputValue, reason) => {
                // Commit everything before the last separator so pasted lists become chips.
                const parts = newInputValue.split(/[\s,;]+/);
                const pending = parts.pop() ?? '';
                if (reason === 'input' && parts.length) {
                  setAddresses((current) =>
                    mergeAddresses(current, parts.flatMap(splitEmailAddresses)),
                  );
                  setInputValue(pending);
                } else {
                  setInputValue(newInputValue);
                }
              }}
              renderValue={(value, getItemProps) =>
                value.map((address, index) => {
                  const { key, ...itemProps } = getItemProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...itemProps}
                      size="small"
                      label={address}
                      color={isValidEmailAddress(address) ? 'default' : 'error'}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('Email addresses')}
                  error={hasError}
                  helperText={helperText}
                  autoFocus
                />
              )}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <CancelButton onClick={handleClose} disabled={sending}>
          {t('Cancel')}
        </CancelButton>
        <SubmitButton
          type="button"
          variant="contained"
          onClick={handleSend}
          disabled={sending || !recipients.length || hasError}
        >
          {t('Send Worksheet')}
        </SubmitButton>
      </DialogActions>
    </>
  );
};

/** Collects the addresses a scenario goal's worksheet is emailed to, prefilled with the scenario's own. */
export const SendScenarioGoalDialog: React.FC<SendScenarioGoalDialogProps> = ({
  isOpen,
  goal,
  onSend,
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      title={t('Email Support Goals Worksheet')}
      handleClose={handleClose}
    >
      {goal && (
        <SendScenarioGoalForm
          key={goal.id}
          goal={goal}
          onSend={onSend}
          handleClose={handleClose}
        />
      )}
    </Modal>
  );
};
