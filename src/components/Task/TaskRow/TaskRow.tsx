import React from 'react';
import LocalOffer from '@mui/icons-material/LocalOffer';
import {
  Avatar,
  Box,
  Chip,
  Hidden,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { GetContactHrefObject } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import { StyledCheckbox } from 'src/components/Contacts/ContactRow/ContactRow';
import { usePhaseData } from 'src/hooks/usePhaseData';
import useTaskModal from '../../../hooks/useTaskModal';
import { TaskCommentsButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCommentsButton/TaskCommentsButton';
import { TaskCompleteButton } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskCompleteButton/TaskCompleteButton';
import { TaskDate } from '../../Contacts/ContactDetails/ContactTasksTab/ContactTaskRow/TaskDate/TaskDate';
import { DeleteTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/DeleteTaskIconButton/DeleteTaskIconButton';
import { StarTaskIconButton } from '../../Contacts/ContactDetails/ContactTasksTab/StarTaskIconButton/StarTaskIconButton';
import { TaskModalEnum } from '../Modal/TaskModal';
import { CommentTooltipText } from './CommentTooltipText';
import { TaskActionPhase } from './TaskActionPhase';
import { TaskRowFragment } from './TaskRow.generated';
import { TaskRowContactName } from './TaskRowContactName';

const ContactText = styled(Typography)(({ theme }) => ({
  margin: '0px',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.text.primary,
  fontSize: '14px',
  letterSpacing: '0.25',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  flexGrow: 1,
  display: 'inline',
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const TaskRowWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isChecked',
})<{ isChecked?: boolean }>(({ theme, isChecked }) => ({
  ...(isChecked ? { backgroundColor: theme.palette.cruGrayLight.main } : {}),
  minWidth: '300px',
}));

const ContactRowButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'useTopMargin',
})<{ useTopMargin?: boolean }>(({ useTopMargin }) => ({
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

type OnContactClickFunction = (
  event: React.MouseEvent<HTMLElement, MouseEvent>,
  contactId: string,
) => void;

interface TaskRowProps {
  accountListId: string;
  task: TaskRowFragment;
  isChecked: boolean;
  onContactSelected: (taskId: string) => void;
  onTaskCheckToggle: (taskId: string) => void;
  useTopMargin?: boolean;
  getContactHrefObject?: GetContactHrefObject;
  removeSelectedIds?: (id: string[]) => void;
  filterPanelOpen: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  accountListId,
  task,
  isChecked,
  onContactSelected,
  onTaskCheckToggle,
  useTopMargin,
  getContactHrefObject,
  removeSelectedIds,
  filterPanelOpen,
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
  const isLarge = useMediaQuery(theme.breakpoints.down('lg'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const isXs = useMediaQuery('(max-width:500px)');
  const condensed = (filterPanelOpen && isLarge) || isMedium;

  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const onContactClick: OnContactClickFunction = (event, contactId) => {
    event.preventDefault();
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
  const tagListString = !!task.tagList.length
    ? t('Tags: ') + task.tagList.join(', ')
    : '';
  const tagsToShow = 3;
  const areMoreTags = tagsToShow < task.tagList.length;

  return (
    <TaskRowWrapper role="row" p={1} isChecked={isChecked}>
      <ContactRowButton
        display="flex"
        alignItems="center"
        data-testid="task-row"
        onClick={() => onTaskCheckToggle(taskId)}
        useTopMargin={useTopMargin}
      >
        <Box
          sx={{
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
              <StyledCheckbox
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
            sx={{
              display: 'flex',
              width: '100%',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexDirection: isXs ? 'column' : 'row',
            }}
          >
            {(activityData?.phase || activityType) && (
              <Box
                sx={{ display: 'flex' }}
                onClick={(e) => {
                  handleSubjectPressed();
                  e.stopPropagation();
                }}
                onMouseEnter={() => preloadTaskModal(TaskModalEnum.Edit)}
              >
                <TaskActionPhase
                  activityData={activityData}
                  activityType={activityType}
                  isXs={isXs}
                />
              </Box>
            )}
            <Box
              sx={{
                width: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Tooltip title={subject} placement="top-start">
                <ContactText
                  data-testid="subject-wrap"
                  onClick={(e) => {
                    handleSubjectPressed();
                    e.stopPropagation();
                  }}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Edit)}
                >
                  {subject}
                </ContactText>
              </Tooltip>

              <Box
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {contacts.nodes.map((contact, index) => {
                  return (
                    <TaskRowContactName
                      contact={contact}
                      itemIndex={index}
                      contactsLength={contacts.nodes.length}
                      selectContact={onContactClick}
                      getContactHrefObject={getContactHrefObject}
                      key={contact.id}
                    />
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          <Hidden smDown>
            {!!task?.tagList.length && (
              <Tooltip
                title={condensed || areMoreTags ? tagListString : null}
                enterTouchDelay={0}
                placement="top"
                arrow
              >
                {condensed ? (
                  <LocalOffer
                    sx={{ color: theme.palette.secondary.dark, mx: 0.5 }}
                  />
                ) : (
                  <Box>
                    {task.tagList.slice(0, tagsToShow).map((task, idx) => (
                      <Chip
                        key={idx}
                        label={task}
                        size="small"
                        sx={{ marginX: '2px' }}
                      />
                    ))}
                    {areMoreTags && '...'}
                  </Box>
                )}
              </Tooltip>
            )}
            {task?.user && (
              <Tooltip
                title={assigneeName}
                placement="top"
                arrow
                enterTouchDelay={0}
              >
                <Avatar
                  data-testid={`assigneeAvatar-${taskId}`}
                  sx={{
                    width: 30,
                    height: 30,
                    mx: 0.5,
                  }}
                >
                  {(task?.user?.firstName?.[0] || '') +
                    task?.user?.lastName?.[0] || ''}
                </Avatar>
              </Tooltip>
            )}
          </Hidden>
          <Box
            sx={{ display: 'flex', flexDirection: isMedium ? 'column' : 'row' }}
          >
            <TaskDate
              isComplete={isComplete}
              taskDate={taskDate}
              small={isMedium}
            />
            <Tooltip
              title={
                comments.totalCount ? (
                  <CommentTooltipText comments={comments.nodes} />
                ) : null
              }
              placement="top"
              arrow
            >
              <Box onClick={(e) => e.stopPropagation()}>
                <TaskCommentsButton
                  isComplete={isComplete}
                  numberOfComments={comments?.totalCount}
                  onClick={handleCommentButtonPressed}
                  onMouseEnter={() => preloadTaskModal(TaskModalEnum.Comments)}
                  small={isMedium}
                  detailsPage={isMedium}
                />
              </Box>
            </Tooltip>
          </Box>

          <Hidden smDown>
            <Box onClick={(e) => e.stopPropagation()}>
              <DeleteTaskIconButton
                accountListId={accountListId}
                taskId={taskId}
                removeSelectedIds={removeSelectedIds}
                small={condensed}
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
