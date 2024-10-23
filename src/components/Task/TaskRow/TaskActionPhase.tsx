import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import { ActivityData } from 'src/hooks/usePhaseData';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';

export const SubjectWrapOuter = styled(Box)(({ theme }) => ({
  width: 'fit-content',
  alignItems: 'center',
  marginRight: theme.spacing(1),
}));

export const SubjectWrapInner = styled(Box)(({}) => ({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const TaskPhase = styled(Typography)(() => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 700,
}));

const TaskType = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 400,
  marginRight: theme.spacing(0.5),
}));

interface TaskActionPhaseProps {
  activityData: ActivityData | null | undefined;
  activityType: ActivityTypeEnum | null | undefined;
}

export const TaskActionPhase: React.FC<TaskActionPhaseProps> = ({
  activityData,
  activityType,
}) => {
  const { t } = useTranslation();
  return (
    <SubjectWrapOuter>
      <SubjectWrapInner
        data-testid="phase-action-wrap"
        style={{
          minWidth: '92px',
          flexDirection: 'column',
        }}
      >
        <TaskPhase>{activityData?.phase ? activityData.phase : ''}</TaskPhase>
        <TaskType>{getLocalizedTaskType(t, activityType)}</TaskType>
      </SubjectWrapInner>
    </SubjectWrapOuter>
  );
};
