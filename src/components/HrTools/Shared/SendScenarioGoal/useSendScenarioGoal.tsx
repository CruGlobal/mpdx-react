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
 * The pick-recipients-then-email flow behind both send entry points: the
 * Scenario Goals row action and the scenario's own Goal Settings page.
 */
export const useSendScenarioGoal = (): SendScenarioGoalFlow => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [sendScenarioGoal] = useSendNewStaffScenarioGoalMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<SendableScenarioGoal | null>(null);

  const requestSend = (goal: SendableScenarioGoal) => {
    setTarget(goal);
    setIsOpen(true);
  };

  const handleSend = async (emailAddresses: string[]) => {
    if (!target) {
      return;
    }
    const { data } = await sendScenarioGoal({
      variables: { id: target.id, emailAddresses },
    });
    const sentTo = data?.sendNewStaffScenarioGoal?.sentTo;
    if (!sentTo?.length) {
      return;
    }
    enqueueSnackbar(
      t('Support goals worksheet sent to {{recipients}}.', {
        recipients: sentTo.join(', '),
      }),
      { variant: 'success' },
    );
  };

  return {
    requestSend,
    dialogProps: {
      isOpen,
      goal: target,
      onSend: handleSend,
      handleClose: () => setIsOpen(false),
    },
  };
};
