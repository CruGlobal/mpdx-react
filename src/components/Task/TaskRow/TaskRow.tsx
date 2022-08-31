import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Hidden,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { TaskCompleteButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCompleteButton/TaskCompleteButton';
import { StarTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/StarTaskIconButton/StarTaskIconButton';
import { DeleteTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/DeleteTaskIconButton/DeleteTaskIconButton';
import { TaskDueDate } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskDueDate/TaskDueDate';
import { TaskCommentsButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCommentsButton/TaskCommentsButton';
import useTaskModal from '../../../hooks/useTaskModal';
import { TaskRowFragment } from './TaskRow.generated';

const SubjectWrapOuter = styled(Box)(({}) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
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
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontSize: '14px',
  letterSpacing: '0.25',
}));

const TaskType = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  marginRight: theme.spacing(0.5),
}));

const TaskContactName = styled(ContactText)(({ theme }) => ({
  fontWeight: 700,
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
}

export const TaskRow: React.FC<TaskRowProps> = ({
  accountListId,
  task,
  isChecked,
  onContactSelected,
  onTaskCheckToggle,
  useTopMargin,
}) => {
  const { t } = useTranslation();

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

  const { openTaskModal } = useTaskModal();
  const onClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    contactId: string,
  ) => {
    // Prevent parent onClick from firing on child click
    event.stopPropagation();
    onContactSelected(contactId);
  };

  const {
    activityType,
    comments,
    contacts,
    id: taskId,

    starred,
    startAt,
    subject,
  } = task;

  const handleCompleteButtonPressed = () => {
    openTaskModal({ taskId: task?.id, view: 'complete' });
  };

  const handleCommentButtonPressed = () => {
    openTaskModal({
      taskId,
      view: 'comments',
    });
  };

  const handleSubjectPressed = () => {
    openTaskModal({
      taskId,
      view: 'edit',
    });
  };

  const isComplete = !!task.completedAt;
  const dueDate = (startAt && DateTime.fromISO(startAt)) || null;
  const assigneeName = `${task?.user?.firstName ?? ''} ${
    task.user?.lastName ?? ''
  }`;

  return (
    <Box role="row" p={1}>
      <ContactRowButton
        display="flex"
        alignItems="center"
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
                color="default"
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
            />
          </Box>

          <Box
            display="flex"
            flexDirection="column"
            style={{
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Box display="flex">
              {contacts.nodes.map((contact, index) => (
                <TaskContactName
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
            <SubjectWrapOuter>
              <SubjectWrapInner
                data-testid="subject-wrap"
                onClick={(e) => {
                  handleSubjectPressed();
                  e.stopPropagation();
                }}
              >
                <TaskType>{activityType ? t(activityType) : ''}</TaskType>
                <Tooltip title={subject}>
                  <ContactText>{subject}</ContactText>
                </Tooltip>
              </SubjectWrapInner>
            </SubjectWrapOuter>
            <Hidden smUp>
              <Button>
                <ContactText>{assigneeName}</ContactText>
              </Button>
            </Hidden>
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Hidden xsDown>
            <ContactText>{assigneeName}</ContactText>
            <TaskDueDate isComplete={isComplete} dueDate={dueDate} />
            <Box onClick={(e) => e.stopPropagation()}>
              <TaskCommentsButton
                isComplete={isComplete}
                numberOfComments={comments?.totalCount}
                onClick={handleCommentButtonPressed}
              />
            </Box>
          </Hidden>
          <Hidden smUp>
            <Box>
              <TaskDueDate isComplete={isComplete} dueDate={dueDate} small />
              <Box>
                <TaskCommentsButton
                  isComplete={isComplete}
                  numberOfComments={comments?.totalCount}
                  onClick={handleCommentButtonPressed}
                  small
                />
              </Box>
            </Box>
          </Hidden>
          <Hidden xsDown>
            <Box onClick={(e) => e.stopPropagation()}>
              <DeleteTaskIconButton
                accountListId={accountListId}
                taskId={taskId}
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
    </Box>
  );
};
