import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useSendNewStaffScenarioGoalMutation } from './SendScenarioGoal.generated';
import { SendScenarioGoalDialogProps } from './SendScenarioGoalDialog';
import { SendableScenarioGoal } from './sendScenarioGoalHelpers';

export interface SendScenarioGoalFlow {
  requestSend: (goal: SendableScenarioGoal) => void;
  dialogProps: SendScenarioGoalDialogProps;
}

/**
 * The pick-a-recipient-then-email flow behind both send entry points: the
 * Scenario Goals row action and the scenario's own Goal Settings page.
 */
export const useSendScenarioGoal = (): SendScenarioGoalFlow => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [sendScenarioGoal] = useSendNewStaffScenarioGoalMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<SendableScenarioGoal | null>(null);
  const [requestId, setRequestId] = useState(0);

  const requestSend = (goal: SendableScenarioGoal) => {
    setTarget(goal);
    setRequestId((id) => id + 1);
    setIsOpen(true);
  };

  // Throws on a GraphQL error, so the toast below only follows a queued send.
  const handleSend = async (emailAddress: string) => {
    if (!target) {
      return;
    }
    await sendScenarioGoal({
      variables: { id: target.id, emailAddress },
    });
    enqueueSnackbar(
      t('Support goals worksheet sent to {{emailAddress}}.', { emailAddress }),
      { variant: 'success' },
    );
  };

  return {
    requestSend,
    dialogProps: {
      isOpen,
      goal: target,
      requestId,
      onSend: handleSend,
      handleClose: () => setIsOpen(false),
    },
  };
};
