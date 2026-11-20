import React from 'react';
import { useTranslation } from 'react-i18next';
import { NewStaffCohortAttendeeQuestionnaireStateEnum } from 'src/graphql/types.generated';
import { StatusChip } from '../../Shared/StatusChip';
import { StaffGoalRow } from '../mpdGoalAdminHelpers';

interface QuestionnaireLockChipProps {
  row: StaffGoalRow;
}

/** Flags a household the questionnaire deadline locked out, or one the MPD team reopened. */
export const QuestionnaireLockChip: React.FC<QuestionnaireLockChipProps> = ({
  row,
}) => {
  const { t } = useTranslation();

  if (row.questionnaireReopenedAt) {
    return <StatusChip label={t('Reopened')} color="info" />;
  }
  if (
    row.questionnaireLocked &&
    row.questionnaireState !==
      NewStaffCohortAttendeeQuestionnaireStateEnum.Completed
  ) {
    return <StatusChip label={t('Not submitted')} color="error" />;
  }
  return null;
};
