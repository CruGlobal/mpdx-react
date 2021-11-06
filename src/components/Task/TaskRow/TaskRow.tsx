import React from 'react';
import { Box, Checkbox, styled, Tooltip, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { TaskCompleteButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCompleteButton/TaskCompleteButton';
import { ResultEnum } from '../../../../graphql/types.generated';
import useTaskDrawer from '../../../hooks/useTaskDrawer';
import { StarTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/StarTaskIconButton/StarTaskIconButton';
import { TaskDueDate } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskDueDate/TaskDueDate';
import { TaskCommentsButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCommentsButton/TaskCommentsButton';
import { TaskDrawerTabsEnum } from '../Drawer/Drawer';
import { TaskRowFragment } from './TaskRow.generated';

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
}

export const TaskRow: React.FC<TaskRowProps> = ({
  accountListId,
  task,
  isChecked,
  onContactSelected,
  onTaskCheckToggle,
}) => {
  const { t } = useTranslation();

  const { openTaskDrawer } = useTaskDrawer();
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
    result,
    starred,
    startAt,
    subject,
  } = task;

  const handleCompleteButtonPressed = () => {
    openTaskDrawer({ taskId: task?.id, showCompleteForm: true });
  };

  const handleCommentButtonPressed = () => {
    openTaskDrawer({
      taskId,
      specificTab: TaskDrawerTabsEnum.comments,
    });
  };

  const isComplete = result === ResultEnum.Completed;
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
            flexGrow: 1,
            textOverflow: 'ellipsis',
          }}
        >
          <Box padding="checkbox">
            <Checkbox
              checked={isChecked}
              color="default"
              onChange={() => onTaskCheckToggle(taskId)}
              value={isChecked}
            />
          </Box>
          <Box>
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
                  onClick={(e) => onClick(e, contact.id)}
                >
                  {index !== contacts.nodes.length - 1
                    ? `${contact.name},`
                    : contact.name}
                </TaskContactName>
              ))}
            </Box>
            <Box
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
              }}
            >
              <TaskType>{activityType ? t(activityType) : ''}</TaskType>
              <Tooltip title={subject}>
                <ContactText>{subject}</ContactText>
              </Tooltip>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <ContactText>{assigneeName}</ContactText>
          <TaskDueDate isComplete={isComplete} dueDate={dueDate} />
          <TaskCommentsButton
            isComplete={isComplete}
            numberOfComments={comments?.totalCount}
            onClick={handleCommentButtonPressed}
          />
          <StarTaskIconButton
            accountListId={accountListId}
            taskId={taskId}
            isStarred={starred}
          />
        </Box>
      </ContactRowButton>
    </Box>
  );
};
