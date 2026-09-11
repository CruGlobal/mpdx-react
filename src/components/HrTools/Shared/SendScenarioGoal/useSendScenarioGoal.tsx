import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { ConfirmationProps } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useSendNewStaffScenarioGoalMutation } from './SendScenarioGoal.generated';
import {
  SendableScenarioGoal,
  scenarioGoalRecipients,
} from './sendScenarioGoalHelpers';

export interface SendScenarioGoalFlow {
  requestSend: (goal: SendableScenarioGoal) => void;
  confirmationProps: ConfirmationProps;
}

/**
 * The confirm-then-email flow behind both send entry points: the Scenario Goals
 * row action and the scenario's own Goal Settings page. An email cannot be
 * un-sent, so the confirmation names the exact addresses first.
 */
export const useSendScenarioGoal = (): SendScenarioGoalFlow => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [sendScenarioGoal] = useSendNewStaffScenarioGoalMutation();
  const [isOpen, setIsOpen] = useState(false);
  // Kept through the close transition so the message doesn't flash empty.
  const [target, setTarget] = useState<SendableScenarioGoal | null>(null);

  const requestSend = (goal: SendableScenarioGoal) => {
    setTarget(goal);
    setIsOpen(true);
  };

  const handleSend = async () => {
    if (!target) {
      return;
    }

    const { data } = await sendScenarioGoal({ variables: { id: target.id } });
    const sentTo = data?.sendNewStaffScenarioGoal?.sentTo ?? [];

    // An address can disappear between render and send, and the API answers
    // that with an empty list rather than an error.
    if (!sentTo.length) {
      enqueueSnackbar(
        t('That scenario goal has no email address, so nothing was sent.'),
        { variant: 'info' },
      );
      return;
    }

    enqueueSnackbar(
      t('Support goals worksheet sent to {{recipients}}.', {
        recipients: sentTo.join(', '),
      }),
      { variant: 'success' },
    );
  };

  const name = target
    ? [target.firstName, target.lastName].filter(Boolean).join(' ') ||
      t('this scenario goal')
    : '';

  return {
    requestSend,
    confirmationProps: {
      isOpen,
      title: t('Email Support Goals Worksheet'),
      message: t(
        'Email the support goals worksheet for {{name}} to {{recipients}}? This cannot be undone.',
        {
          name,
          recipients: scenarioGoalRecipients(target ?? { id: '' }).join(', '),
        },
      ),
      confirmLabel: t('Send Worksheet'),
      confirmButtonProps: { variant: 'contained' },
      // The global Apollo error link toasts a failure; Confirmation swallows the rejection.
      mutation: handleSend,
      handleClose: () => setIsOpen(false),
    },
  };
};
