import React from 'react';
import { MailOutline } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import {
  SendableScenarioGoal,
  scenarioGoalSendBlockedReason,
} from './sendScenarioGoalHelpers';
import { useSendScenarioGoal } from './useSendScenarioGoal';

interface SendScenarioGoalButtonProps {
  /** The saved scenario goal, which is what the worksheet is rendered from. */
  goal: SendableScenarioGoal;
  /** A caller-supplied reason that outranks the goal's own; null when the caller has none. */
  disabledReason?: string | null;
}

/** Emails a scenario goal's worksheet from the goal's own page. */
export const SendScenarioGoalButton: React.FC<SendScenarioGoalButtonProps> = ({
  goal,
  disabledReason,
}) => {
  const { t } = useTranslation();
  const { requestSend, confirmationProps } = useSendScenarioGoal();
  const blockedReason =
    disabledReason ?? scenarioGoalSendBlockedReason(goal, t);

  return (
    <>
      <Tooltip title={blockedReason ?? ''}>
        {/* The span is needed: a disabled button has neither mouse events nor a tab stop. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the disabled child has no tab stop of its own */}
        <span tabIndex={0}>
          <Button
            color="inherit"
            startIcon={<MailOutline />}
            disabled={Boolean(blockedReason)}
            onClick={() => requestSend(goal)}
          >
            {t('Email Worksheet')}
          </Button>
        </span>
      </Tooltip>
      <Confirmation {...confirmationProps} />
    </>
  );
};
