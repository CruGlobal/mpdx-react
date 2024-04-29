import React, { useState } from 'react';
import { Box, Checkbox, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import useTaskModal from 'src/hooks/useTaskModal';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import theme from '../../../../../theme';
import { TaskRowFragment } from '../../../../Task/TaskRow/TaskRow.generated';
import { StarredItemIcon } from '../../../../common/StarredItemIcon/StarredItemIcon';
import { DeleteTaskIconButton } from '../DeleteTaskIconButton/DeleteTaskIconButton';
import { StarTaskIconButton } from '../StarTaskIconButton/StarTaskIconButton';
import { TaskCommentsButton } from './TaskCommentsButton/TaskCommentsButton';
import { TaskCompleteButton } from './TaskCompleteButton/TaskCompleteButton';
import { TaskDate } from './TaskDate/TaskDate';

const TaskRowWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isChecked',
})<{ isChecked?: boolean }>(({ theme, isChecked }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: theme.spacing(0),
  height: theme.spacing(8),
  ...(isChecked ? { backgroundColor: theme.palette.cruGrayLight.main } : {}),
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

const FieldLoadingState = styled(Skeleton, {
  shouldForwardProp: (prop) => prop !== 'width' && prop !== 'margin',
})(({ width, margin }: { width: number; margin: string }) => ({
  width,
  height: '24px',
  margin: margin,
}));

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
  const [hasBeenDeleted, setHasBeenDeleted] = useState<boolean>(false);

  const { openTaskModal, preloadTaskModal } = useTaskModal();

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

  const handleDeleteConfirm = () => {
    setHasBeenDeleted(true);
  };

  if (!task) {
    return (
      <TaskRowWrap data-testid="loadingRow" isChecked={isChecked}>
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

  const { activityType, user, comments, startAt, completedAt, subject } = task;
  const isComplete = !!completedAt;
  const dateToShow = completedAt ?? startAt;
  const taskDate = (dateToShow && DateTime.fromISO(dateToShow)) || null;
  const assigneeName = user ? `${user.firstName} ${user.lastName}` : '';

  return !hasBeenDeleted ? (
    <TaskRowWrap isChecked={isChecked}>
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
          onMouseEnter={() => preloadTaskModal('complete')}
        />
      </TaskItemWrap>
      <SubjectWrap
        onClick={handleSubjectPressed}
        onMouseEnter={() => preloadTaskModal('edit')}
      >
        <TaskType>{getLocalizedTaskType(t, activityType)}</TaskType>
        <TaskDescription>{subject}</TaskDescription>
      </SubjectWrap>

      <TaskItemWrap justifyContent="end" maxWidth={theme.spacing(45)}>
        <AssigneeName noWrap>{assigneeName}</AssigneeName>
        <Box width={theme.spacing(16)}>
          <TaskDate isComplete={isComplete} taskDate={taskDate} />
        </Box>
        <TaskCommentsButton
          isComplete={isComplete}
          numberOfComments={comments?.totalCount}
          onClick={handleCommentButtonPressed}
          onMouseEnter={() => preloadTaskModal('comments')}
          detailsPage
        />

        <DeleteTaskIconButton
          accountListId={accountListId}
          taskId={task.id}
          onDeleteConfirm={handleDeleteConfirm}
        />
        <StarTaskIconButton
          accountListId={accountListId}
          taskId={task.id}
          isStarred={task.starred}
        />
      </TaskItemWrap>
    </TaskRowWrap>
  ) : null;
};
