import { useId } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { ActivityData } from 'src/hooks/usePhaseData';

export const SubjectWrapOuter = styled(ButtonBase)(({ theme }) => ({
  width: 'fit-content',
  alignItems: 'center',
  marginRight: theme.spacing(1),
  display: 'flex',
  '&:hover, &:focus': {
    textDecoration: 'underline',
  },
}));

export const SubjectWrapInner = styled(Box)({
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  flexDirection: 'column',
  minWidth: '92px',
  '@media (max-width: 500px)': {
    flexDirection: 'row',
    minWidth: 'none',
  },
});

const TaskPhase = styled(Typography)({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  display: 'flex',
});

const TaskType = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 400,
  marginRight: theme.spacing(0.5),
  display: 'flex',
}));

interface TaskActionPhaseProps {
  activityData: ActivityData | null | undefined;
  describedBy?: string;
  isXs?: boolean;
}

export const TaskActionPhase: React.FC<TaskActionPhaseProps> = ({
  activityData,
  describedBy,
  isXs = false,
}) => {
  const { t } = useTranslation();
  const phaseId = useId();

  return (
    <SubjectWrapOuter
      aria-label={t('Edit task')}
      aria-describedby={describedBy ? phaseId + ' ' + describedBy : phaseId}
    >
      <SubjectWrapInner id={phaseId} data-testid="phase-action-wrap">
        {!isXs && (
          <TaskPhase>
            {activityData?.phase ? `${activityData.phase}  ` : ''}
          </TaskPhase>
        )}
        <TaskType>
          {isXs
            ? activityData?.translatedFullName
            : activityData?.translatedShortName}
        </TaskType>
      </SubjectWrapInner>
    </SubjectWrapOuter>
  );
};
