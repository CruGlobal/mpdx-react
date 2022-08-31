import { Box, Checkbox, styled, Typography } from '@mui/material';
import { Skeleton } from '@material-ui/lab';
import { TFunction } from 'i18next';
import { DateTime } from 'luxon';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityTypeEnum } from '../../../../../../graphql/types.generated';
import theme from '../../../../../theme';
import { StarredItemIcon } from '../../../../common/StarredItemIcon/StarredItemIcon';
import { TaskRowFragment } from '../../../../Task/TaskRow/TaskRow.generated';
import { StarTaskIconButton } from '../StarTaskIconButton/StarTaskIconButton';
import { DeleteTaskIconButton } from '../DeleteTaskIconButton/DeleteTaskIconButton';
import { TaskCommentsButton } from './TaskCommentsButton/TaskCommentsButton';
import { TaskCompleteButton } from './TaskCompleteButton/TaskCompleteButton';
import { TaskDueDate } from './TaskDueDate/TaskDueDate';
import useTaskModal from 'src/hooks/useTaskModal';

const TaskRowWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: theme.spacing(0),
  height: theme.spacing(8),
}));

const TaskItemWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: theme.spacing(0),
  height: '100%',
}));

const TaskType = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const TaskDescription = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  marginLeft: theme.spacing(0.5),
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}));

const SubjectWrap = styled(Box)(({}) => ({
  width: '100%',
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'start',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const AssigneeName = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  margin: theme.spacing(1),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const StarIconWrap = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const FieldLoadingState = styled(Skeleton)(
  ({ width, margin }: { width: number; margin: number }) => ({
    width,
    height: '24px',
    margin: margin,
  }),
);

const getLocalizedTaskType = (
  t: TFunction,
  taskType: ActivityTypeEnum | null | undefined,
): string => {
  if (!taskType) {
    return '';
  }

  switch (taskType) {
    case ActivityTypeEnum.Appointment:
      return t('Appointment');

    case ActivityTypeEnum.Call:
      return t('Call');

    case ActivityTypeEnum.Email:
      return t('Email');

    case ActivityTypeEnum.FacebookMessage:
      return t('Facebook Message');

    case ActivityTypeEnum.Letter:
      return t('Letter');

    case ActivityTypeEnum.NewsletterEmail:
      return t('Newsletter - Email');

    case ActivityTypeEnum.NewsletterPhysical:
      return t('Newsletter - Physical');

    case ActivityTypeEnum.None:
      return '';

    case ActivityTypeEnum.PrayerRequest:
      return t('Prayer Request');

    case ActivityTypeEnum.PreCallLetter:
      return t('Pre-Call Letter');

    case ActivityTypeEnum.ReminderLetter:
      return t('Reminder Letter');

    case ActivityTypeEnum.SupportLetter:
      return t('Support Letter');

    case ActivityTypeEnum.TalkToInPerson:
      return t('Talk To In Person');

    case ActivityTypeEnum.TextMessage:
      return t('Text Message');

    case ActivityTypeEnum.Thank:
      return t('Thank');

    case ActivityTypeEnum.ToDo:
      return t('To Do');
  }
};

interface ContactTaskRowProps {
  accountListId: string;
  task?: TaskRowFragment;
  isChecked: boolean;
  onTaskCheckToggle: (contactId: string) => void;
}

export const ContactTaskRow: React.FC<ContactTaskRowProps> = ({
  accountListId,
  task,
  isChecked,
  onTaskCheckToggle,
}) => {
  const { t } = useTranslation();

  const { openTaskModal } = useTaskModal();

  const handleCompleteButtonPressed = () => {
    openTaskModal({
      taskId: task?.id,
      showCompleteForm: true,
      view: 'complete',
    });
  };

  const handleCommentButtonPressed = () => {
    openTaskModal({
      taskId: task?.id,
      view: 'comments',
    });
  };

  const handleSubjectPressed = () => {
    openTaskModal({
      taskId: task?.id,
      view: 'edit',
    });
  };

  if (!task) {
    return (
      <TaskRowWrap data-testid="loadingRow">
        <TaskItemWrap>
          <Checkbox />
          <FieldLoadingState width={55} margin={theme.spacing(2)} />
          <FieldLoadingState width={200} margin={theme.spacing(0.5)} />
        </TaskItemWrap>
        <TaskItemWrap>
          <FieldLoadingState width={120} margin={theme.spacing(1)} />
          <FieldLoadingState width={80} margin={theme.spacing(1)} />
          <FieldLoadingState width={58} margin={theme.spacing(2)} />
          <StarIconWrap>
            <StarredItemIcon isStarred={false} />
          </StarIconWrap>
        </TaskItemWrap>
      </TaskRowWrap>
    );
  }

  const { activityType, user, comments, startAt, subject } = task;

  const dueDate = (startAt && DateTime.fromISO(startAt)) || null;

  const assigneeName = user ? `${user.firstName} ${user.lastName}` : '';

  const isComplete = !!task.completedAt;

  return (
    <TaskRowWrap>
      <TaskItemWrap width={theme.spacing(20)} justifyContent="space-between">
        <Checkbox
          checked={isChecked}
          color="secondary"
          onChange={() => onTaskCheckToggle(task.id)}
          value={isChecked}
        />
        <TaskCompleteButton
          isComplete={isComplete}
          onClick={handleCompleteButtonPressed}
        />
      </TaskItemWrap>
      <SubjectWrap onClick={handleSubjectPressed}>
        <TaskType>{getLocalizedTaskType(t, activityType)}</TaskType>
        <TaskDescription>{subject}</TaskDescription>
      </SubjectWrap>

      <TaskItemWrap justifyContent="end" maxWidth={theme.spacing(45)}>
        <AssigneeName noWrap>{assigneeName}</AssigneeName>
        <Box width={theme.spacing(12)}>
          <TaskDueDate isComplete={isComplete} dueDate={dueDate} />
        </Box>
        <TaskCommentsButton
          isComplete={isComplete}
          numberOfComments={comments?.totalCount}
          onClick={handleCommentButtonPressed}
          detailsPage
        />

        <DeleteTaskIconButton accountListId={accountListId} taskId={task.id} />
        <StarTaskIconButton
          accountListId={accountListId}
          taskId={task.id}
          isStarred={task.starred}
        />
      </TaskItemWrap>
    </TaskRowWrap>
  );
};
