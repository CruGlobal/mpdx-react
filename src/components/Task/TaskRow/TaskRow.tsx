import React from 'react';
import {
  Box,
  Checkbox,
  Hidden,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { usePhaseData } from 'src/hooks/usePhaseData';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import useTaskModal from '../../../hooks/useTaskModal';
import { TaskCommentsButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCommentsButton/TaskCommentsButton';
import { TaskCompleteButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCompleteButton/TaskCompleteButton';
import { TaskDate } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskDate/TaskDate';
import { DeleteTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/DeleteTaskIconButton/DeleteTaskIconButton';
import { StarTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/StarTaskIconButton/StarTaskIconButton';
import { TaskModalEnum } from '../Modal/TaskModal';
import { TaskRowFragment } from './TaskRow.generated';

const SubjectWrapOuter = styled(Box)(({ theme }) => ({
  width: 'fit-content',
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(1),
}));

const SubjectWrapInner = styled(Box)(({}) => ({
  display: 'flex',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const ContactText = styled(Typography)(({ theme }) => ({
  margin: '0px',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  fontSize: '14px',
  letterSpacing: '0.25',
}));

const TaskPhase = styled(Typography)(() => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 700,
}));

const TaskType = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'condensed',
})<{ condensed?: boolean }>(({ theme, condensed = false }) => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: condensed ? 400 : 700,
  marginRight: theme.spacing(0.5),
}));

const TaskContactName = styled(ContactText)(({ theme }) => ({
  fontWeight: 700,
  whiteSpace: 'nowrap',
  marginRight: theme.spacing(0.5),
  '&:hover': {
    textDecoration: 'underline',
  },
}));

interface TaskRowProps {
  accountListId: string;
  task: TaskRowFragment;
  isChecked: boolean;
  onContactSelected: (taskId: string) => void;
  onTaskCheckToggle: (taskId: string) => void;
  useTopMargin?: boolean;
  contactDetailsOpen?: boolean;
  removeSelectedIds?: (id: string[]) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  accountListId,
  task,
  isChecked,
  onContactSelected,
  onTaskCheckToggle,
  useTopMargin,
  contactDetailsOpen,
  removeSelectedIds,
}) => {
  const {
    activityType,
    comments,
    contacts,
    id: taskId,
    starred,
    startAt,
    completedAt,
    subject,
  } = task;
  const { t } = useTranslation();
  const { activityTypes } = usePhaseData();
  const activityData = activityType ? activityTypes.get(activityType) : null;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const condensed = isSmallScreen || contactDetailsOpen;

  const TaskRowWrapper = styled(Box)(({ theme }) => ({
    ...(isChecked ? { backgroundColor: theme.palette.cruGrayLight.main } : {}),
  }));

  const ContactRowButton = styled(Box)(({}) => ({
    height: '56px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    alignContent: 'center',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: useTopMargin ? '20px' : '0',
  }));

  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const onClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    contactId: string,
  ) => {
    // Prevent parent onClick from firing on child click
    event.stopPropagation();
    onContactSelected(contactId);
  };

  const handleCompleteButtonPressed = () => {
    openTaskModal({ taskId: task?.id, view: TaskModalEnum.Complete });
  };

  const handleCommentButtonPressed = () => {
    openTaskModal({
      taskId,
      view: TaskModalEnum.Comments,
    });
  };

  const handleSubjectPressed = () => {
    openTaskModal({
      taskId,
      view: TaskModalEnum.Edit,
    });
  };

  const isComplete = !!completedAt;
  const dateToShow = completedAt ?? startAt;
  const taskDate = (dateToShow && DateTime.fromISO(dateToShow)) || null;
  const assigneeName = `${task?.user?.firstName ?? ''} ${
    task.user?.lastName ?? ''
  }`;

  return (
    <TaskRowWrapper role="row" p={1}>
      <ContactRowButton
        display="flex"
        alignItems="center"
        data-testid="task-row"
        onClick={() => onTaskCheckToggle(taskId)}
      >
        <Box
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          <Hidden xsDown>
            <Box padding="checkbox">
              <Checkbox
                checked={isChecked}
                data-testid={`task-checkbox-${taskId}`}
                color="secondary"
                onClick={(event) => event.stopPropagation()}
                onChange={() => onTaskCheckToggle(taskId)}
                value={isChecked}
              />
            </Box>
          </Hidden>
          <Box onClick={(e) => e.stopPropagation()}>
            <TaskCompleteButton
              isComplete={isComplete}
              onClick={handleCompleteButtonPressed}
              onMouseEnter={() => preloadTaskModal(TaskModalEnum.Complete)}
            />
          </Box>

          <Box
            display="flex"
            style={{
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {(activityData?.phase || activityType) && (
              <SubjectWrapOuter>
                <SubjectWrapInner
                  data-testid="phase-action-wrap"
                  onClick={(e) => {
                    handleSubjectPressed();
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Edit)}
                  style={{
                    minWidth: condensed ? '92px' : 'none',
                    flexDirection: condensed ? 'column' : 'row',
                  }}
                >
                  <TaskPhase>
                    {activityData?.phase && condensed
                      ? activityData.phase
                      : activityData?.phase
                      ? activityData.phase + ' - ' + '\u00A0'
                      : ''}
                  </TaskPhase>
                  <TaskType condensed={condensed}>
                    {activityType ? getLocalizedTaskType(t, activityType) : ''}
                  </TaskType>
                </SubjectWrapInner>
              </SubjectWrapOuter>
            )}
            <Box
              style={{
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                flexDirection: condensed ? 'column' : 'row',
              }}
            >
              <SubjectWrapOuter>
                <SubjectWrapInner
                  data-testid="subject-wrap"
                  onClick={(e) => {
                    handleSubjectPressed();
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Edit)}
                >
                  <Tooltip title={subject} placement="top-start">
                    <ContactText>{subject}</ContactText>
                  </Tooltip>
                </SubjectWrapInner>
              </SubjectWrapOuter>
              <Box
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {contacts.nodes.map((contact, index) => (
                  <TaskContactName
                    noWrap
                    display="inline"
                    key={contact.id}
                    onClick={(e) => {
                      onClick(e, contact.id);
                      e.stopPropagation();
                    }}
                  >
                    {index !== contacts.nodes.length - 1
                      ? `${contact.name},`
                      : contact.name}
                  </TaskContactName>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Hidden smDown>
            <ContactText>{assigneeName}</ContactText>
            <TaskDate isComplete={isComplete} taskDate={taskDate} />
            <Box onClick={(e) => e.stopPropagation()}>
              <TaskCommentsButton
                isComplete={isComplete}
                numberOfComments={comments?.totalCount}
                onClick={handleCommentButtonPressed}
                onMouseEnter={() => preloadTaskModal(TaskModalEnum.Comments)}
              />
            </Box>
          </Hidden>
          <Hidden smUp>
            <Box>
              <TaskDate isComplete={isComplete} taskDate={taskDate} small />
              <Box>
                <TaskCommentsButton
                  isComplete={isComplete}
                  numberOfComments={comments?.totalCount}
                  onClick={handleCommentButtonPressed}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Comments)}
                  small
                />
              </Box>
            </Box>
          </Hidden>
          <Hidden smDown>
            <Box onClick={(e) => e.stopPropagation()}>
              <DeleteTaskIconButton
                accountListId={accountListId}
                taskId={taskId}
                removeSelectedIds={removeSelectedIds}
              />
            </Box>
            <Box onClick={(e) => e.stopPropagation()}>
              <StarTaskIconButton
                accountListId={accountListId}
                taskId={taskId}
                isStarred={starred}
              />
            </Box>
          </Hidden>
        </Box>
      </ContactRowButton>
    </TaskRowWrapper>
  );
};
