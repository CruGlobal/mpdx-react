import React, { useState } from 'react';
import LocalOffer from '@mui/icons-material/LocalOffer';
import {
  Avatar,
  Box,
  Checkbox,
  Skeleton,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { StyledCheckbox } from 'src/components/Contacts/ContactRow/ContactRow';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import {
  CommentTooltipText,
  TooltipTypography,
} from 'src/components/Task/TaskRow/CommentTooltipText';
import { TaskActionPhase } from 'src/components/Task/TaskRow/TaskActionPhase';
import { TaskRowFragment } from 'src/components/Task/TaskRow/TaskRow.generated';
import { StarredItemIcon } from 'src/components/common/StarredItemIcon/StarredItemIcon';
import { usePhaseData } from 'src/hooks/usePhaseData';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
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

const TaskDescription = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}));

const SubjectWrap = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  height: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: theme.spacing(0.5),
  justifyContent: 'start',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  ['@media (max-width:500px)']: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
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
  const { activityTypes } = usePhaseData();
  const [hasBeenDeleted, setHasBeenDeleted] = useState<boolean>(false);

  const { openTaskModal, preloadTaskModal } = useTaskModal();

  const handleCompleteButtonPressed = () => {
    openTaskModal({
      taskId: task?.id,
      showCompleteForm: true,
      view: TaskModalEnum.Complete,
    });
  };

  const handleCommentButtonPressed = () => {
    openTaskModal({
      taskId: task?.id,
      view: TaskModalEnum.Comments,
    });
  };

  const handleSubjectPressed = () => {
    openTaskModal({
      taskId: task?.id,
      view: TaskModalEnum.Edit,
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
  const tagList = !!task.tagList.length ? task.tagList.join(', ') : '';
  const activityData = activityType ? activityTypes.get(activityType) : null;
  const isXs = useMediaQuery('(max-width:500px)');
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return !hasBeenDeleted ? (
    <TaskRowWrap isChecked={isChecked}>
      <TaskItemWrap width={theme.spacing(20)} justifyContent="space-between">
        <StyledCheckbox
          checked={isChecked}
          color="secondary"
          onChange={() => onTaskCheckToggle(task.id)}
          value={isChecked}
        />
        <TaskCompleteButton
          isComplete={isComplete}
          onClick={handleCompleteButtonPressed}
          onMouseEnter={() => preloadTaskModal(TaskModalEnum.Complete)}
        />
      </TaskItemWrap>
      <SubjectWrap
        onClick={handleSubjectPressed}
        onMouseEnter={() => preloadTaskModal(TaskModalEnum.Edit)}
      >
        <TaskActionPhase
          activityData={activityData}
          activityType={activityType}
          isXs={isXs}
        />

        <Tooltip title={subject} placement="top-start" arrow>
          <TaskDescription>{subject}</TaskDescription>
        </Tooltip>
      </SubjectWrap>

      <TaskItemWrap justifyContent="end" maxWidth={theme.spacing(45)}>
        {!isXs && (assigneeName || tagList) && (
          <Tooltip
            title={
              <>
                {assigneeName && (
                  <TooltipTypography>
                    {t('Assignee: ') + assigneeName}
                  </TooltipTypography>
                )}
                {tagList && (
                  <TooltipTypography>{t('Tags: ') + tagList}</TooltipTypography>
                )}
              </>
            }
            placement="top"
            arrow
            enterTouchDelay={0}
          >
            {assigneeName ? (
              <Avatar
                data-testid={`assigneeAvatar-${task.id}`}
                sx={{
                  width: 30,
                  height: 30,
                }}
              >
                {(task?.user?.firstName?.[0] || '') +
                  task?.user?.lastName?.[0] || ''}
              </Avatar>
            ) : (
              <LocalOffer
                data-testid={`tagIcon-${task.id}`}
                sx={{ color: theme.palette.secondary.dark }}
              />
            )}
          </Tooltip>
        )}
        <Box>
          <TaskDate isComplete={isComplete} taskDate={taskDate} small />
          <Tooltip
            title={
              comments?.totalCount ? (
                <CommentTooltipText comments={comments.nodes} />
              ) : null
            }
            placement="top"
            arrow
          >
            <Box>
              <TaskCommentsButton
                isComplete={isComplete}
                numberOfComments={comments?.totalCount}
                onClick={handleCommentButtonPressed}
                onMouseEnter={() => preloadTaskModal(TaskModalEnum.Comments)}
                small
              />
            </Box>
          </Tooltip>
        </Box>

        {!isSmall && (
          <>
            <DeleteTaskIconButton
              accountListId={accountListId}
              taskId={task.id}
              onDeleteConfirm={handleDeleteConfirm}
              small
            />
            <StarTaskIconButton
              accountListId={accountListId}
              taskId={task.id}
              isStarred={task.starred}
            />
          </>
        )}
      </TaskItemWrap>
    </TaskRowWrap>
  ) : null;
};
