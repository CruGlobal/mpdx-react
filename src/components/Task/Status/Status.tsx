import React, { ReactElement } from 'react';
import {
  Tooltip,
  Theme,
  makeStyles,
  Avatar,
  IconButton,
  styled,
} from '@material-ui/core';
import { DateTime } from 'luxon';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import { useTranslation } from 'react-i18next';
import { Check } from '@material-ui/icons';
import useTaskModal from 'src/hooks/useTaskModal';

const TaskCompleteButton = styled(IconButton)(({ theme }) => ({
  border: `2px solid ${theme.palette.mpdxGreen.main}`,
  color: theme.palette.common.white,
  height: theme.spacing(2),
  width: theme.spacing(2),
  backgroundColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.mpdxGreen.main,
  },
}));

const useStyles = makeStyles((theme: Theme) => ({
  buttonGreen: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.mpdxGreen.main,
    cursor: 'default',
    '&:hover': {
      backgroundColor: theme.palette.mpdxGreen.main,
    },
  },
  buttonRed: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
  },
  buttonPrimary: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.mpdxBlue.main,
  },
  buttonSmall: {
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    fontSize: '1.4rem',
    cursor: 'pointer',
  },
  buttonWithHover: {
    transition: theme.transitions.create(['background'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      backgroundColor: theme.palette.mpdxGreen.main,
    },
    '&:hover $icon': {
      opacity: 0,
      transform: 'rotate(45deg)',
    },
    '&:hover $hoverIcon': {
      opacity: 1,
      transform: 'rotate(0deg)',
    },
  },
  icon: {
    position: 'absolute',
    left: '7px',
    transition: theme.transitions.create(['transform', 'opacity'], {
      duration: theme.transitions.duration.short,
    }),
    transform: 'rotate(0deg)',
  },
  hoverIcon: {
    opacity: 0,
    left: '6px',
    transform: 'rotate(-45deg)',
    color: theme.palette.common.white,
  },
}));

interface Props {
  taskId?: string;
  startAt?: string;
  completedAt?: string;
  color?: 'primary';
  disableTooltip?: boolean;
  tooltipPlacement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
}

const CompleteButton = ({
  taskId,
  title,
}: {
  taskId: string;
  title?: string;
}): ReactElement => {
  const { openTaskModal } = useTaskModal();

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    taskId && openTaskModal({ taskId, view: 'complete' });
    event.stopPropagation();
  };
  return (
    <TaskCompleteButton onClick={handleClick}>
      <Check titleAccess={title ?? 'Check Icon'} />
    </TaskCompleteButton>
  );
};

const TaskStatus = ({
  taskId,
  startAt,
  completedAt,
  disableTooltip = false,
  tooltipPlacement = 'right',
}: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (completedAt) {
    return (
      <Tooltip
        title={`Completed ${DateTime.fromISO(completedAt).toRelative()}`}
        placement={tooltipPlacement}
        arrow
        disableFocusListener={disableTooltip}
        disableHoverListener={disableTooltip}
        disableTouchListener={disableTooltip}
      >
        <Avatar
          className={[classes.buttonSmall, classes.buttonGreen].join(' ')}
          role="button"
        >
          <AssignmentTurnedInIcon fontSize="inherit" className={classes.icon} />
        </Avatar>
      </Tooltip>
    );
  } else if (startAt) {
    if (DateTime.fromISO(startAt) < DateTime.local()) {
      return (
        <CompleteButton
          taskId={taskId ?? ''}
          title={`Overdue ${DateTime.fromISO(startAt).toRelative()}`}
        />
      );
    } else {
      return (
        <CompleteButton
          taskId={taskId ?? ''}
          title={`Due ${DateTime.fromISO(startAt).toRelative()}`}
        />
      );
    }
  } else {
    return <CompleteButton taskId={taskId ?? ''} title={t('No Due Date')} />;
  }
};

export default TaskStatus;
