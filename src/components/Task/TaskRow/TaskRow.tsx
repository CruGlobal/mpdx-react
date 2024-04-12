import Link from 'next/link';
import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  Hidden,
  Tooltip,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { ContactUrl } from 'pages/accountLists/[accountListId]/tasks/[[...contactId]].page';
import { getLocalizedTaskType } from 'src/utils/functions/getLocalizedTaskType';
import useTaskModal from '../../../hooks/useTaskModal';
import { TaskCommentsButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCommentsButton/TaskCommentsButton';
import { TaskCompleteButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCompleteButton/TaskCompleteButton';
import { TaskDate } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskDate/TaskDate';
import { DeleteTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/DeleteTaskIconButton/DeleteTaskIconButton';
import { StarTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/StarTaskIconButton/StarTaskIconButton';
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

const TaskType = styled(Typography)(({ theme }) => ({
  fontSize: '14px',
  letterSpacing: '0.25',
  whiteSpace: 'nowrap',
  fontWeight: 700,
  marginRight: theme.spacing(0.5),
}));

const TaskContactName = styled(ContactText)(({ theme }) => ({
  fontWeight: 700,
  whiteSpace: 'nowrap',
  marginRight: theme.spacing(0.5),
  '& a': { color: theme.palette.common.black },
  '& a:not(:hover)': { textDecoration: 'none' },
}));

interface TaskRowProps {
  accountListId: string;
  task: TaskRowFragment;
  isChecked: boolean;
  onTaskCheckToggle: (taskId: string) => void;
  getContactUrl: (id?: string) => ContactUrl;
  useTopMargin?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  accountListId,
  task,
  isChecked,
  getContactUrl,
  onTaskCheckToggle,
  useTopMargin,
}) => {
  const { t } = useTranslation();

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

  const { openTaskModal } = useTaskModal();

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
            <SubjectWrapOuter>
              <SubjectWrapInner
                data-testid="subject-wrap"
                onClick={(e) => {
                  handleSubjectPressed();
                  e.stopPropagation();
                }}
              >
                <TaskType>
                  {activityType ? getLocalizedTaskType(t, activityType) : ''}
                </TaskType>
                <Tooltip title={subject}>
                  <ContactText>{subject}</ContactText>
                </Tooltip>
              </SubjectWrapInner>
            </SubjectWrapOuter>
            <Box
              style={{
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {contacts.nodes.map((contact, index) => {
                const { contactUrl } = getContactUrl(contact.id);
                return (
                  <TaskContactName noWrap display="inline" key={contact.id}>
                    <Link
                      href={contactUrl}
                      onClickCapture={(event) => event.stopPropagation}
                    >
                      {index !== contacts.nodes.length - 1
                        ? `${contact.name},`
                        : contact.name}
                    </Link>
                  </TaskContactName>
                );
              })}
            </Box>
            <Hidden smUp>
              <Button>
                <ContactText>{assigneeName}</ContactText>
              </Button>
            </Hidden>
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
