import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { NewStaffCohortAttendeeQuestionnaireStateEnum } from 'src/graphql/types.generated';
import { RunAndSendTooltip } from '../RunAndSendTooltip';
import { GoalStatusEnum, StaffGoalRow } from '../mpdGoalAdminHelpers';
import { useReopenNewStaffQuestionnaireMutation } from './ReopenNewStaffQuestionnaire.generated';

interface GoalRowActionsProps {
  row: StaffGoalRow;
  canRunAndSend: boolean;
  /** A closed training hides the questionnaire, so a reopen would leave nothing to edit. */
  questionnaireOpen: boolean;
  onRunAndSend: (row: StaffGoalRow) => void;
}

/** A row's actions menu: Run & Send its goal, or reopen its questionnaire. */
export const GoalRowActions: React.FC<GoalRowActionsProps> = ({
  row,
  canRunAndSend,
  questionnaireOpen,
  onRunAndSend,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const [reopenQuestionnaire] = useReopenNewStaffQuestionnaireMutation();

  const sent = row.goalStatus === GoalStatusEnum.Sent;
  // Only a submitted or deadline-locked questionnaire has anything to reopen, and a sent goal cannot be
  // taken back, so neither can the answers behind it.
  const canReopen =
    !sent &&
    questionnaireOpen &&
    (row.questionnaireLocked ||
      row.questionnaireState ===
        NewStaffCohortAttendeeQuestionnaireStateEnum.Completed);
  const hasAction = canRunAndSend || canReopen;

  const handleReopen = async () => {
    await reopenQuestionnaire({
      variables: { input: { attendeeId: row.id } },
    });
    enqueueSnackbar(
      t('Questionnaire reopened for {{name}}.', { name: row.name }),
      {
        variant: 'success',
      },
    );
  };

  return (
    <>
      {/* A Sent or reopened row's chip already explains itself; the blocked copy would claim inputs are missing. */}
      <RunAndSendTooltip
        show={!hasAction && !sent && !row.questionnaireReopenedAt}
      >
        <IconButton
          size="small"
          aria-label={t('Actions for {{name}}', { name: row.name })}
          aria-haspopup="menu"
          disabled={!hasAction}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </RunAndSendTooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {/* The reason is text in the item: a tooltip wrapper would take the menu's keyboard focus */}
        <MenuItem
          disabled={!canRunAndSend}
          onClick={() => {
            onRunAndSend(row);
            setAnchorEl(null);
          }}
        >
          <ListItemText
            primary={t('Run & Send this goal')}
            secondary={
              canRunAndSend || sent
                ? undefined
                : t('Needs all inputs and training costs')
            }
          />
        </MenuItem>
        <MenuItem
          disabled={!canReopen}
          onClick={() => {
            setConfirmReopen(true);
            setAnchorEl(null);
          }}
        >
          {t('Reopen Questionnaire')}
        </MenuItem>
      </Menu>
      <Confirmation
        isOpen={confirmReopen}
        title={t('Reopen Questionnaire?')}
        message={t(
          '{{name}} will be able to change and submit their NSO MPD Questionnaire again, even after the deadline, until they submit it. Submitting again updates their goal.',
          { name: row.name },
        )}
        confirmLabel={t('Reopen')}
        cancelLabel={t('Cancel')}
        mutation={handleReopen}
        handleClose={() => setConfirmReopen(false)}
      />
    </>
  );
};
