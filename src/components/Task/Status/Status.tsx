import React, { ReactElement } from 'react';
import { Tooltip, Theme, makeStyles, Fab, Avatar } from '@mui/material';
import { DateTime } from 'luxon';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import { useTranslation } from 'react-i18next';
import DoneIcon from '@material-ui/icons/Done';
import useTaskDrawer from '../../../hooks/useTaskDrawer';

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

const TaskStatus = ({
  taskId,
  startAt,
  completedAt,
  color,
  disableTooltip = false,
  tooltipPlacement = 'right',
}: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openTaskDrawer } = useTaskDrawer();

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    taskId && openTaskDrawer({ taskId, showCompleteForm: true });
    event.stopPropagation();
  };

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
        <Tooltip
          title={`Overdue ${DateTime.fromISO(startAt).toRelative()}`}
          placement={tooltipPlacement}
          arrow
          disableFocusListener={disableTooltip}
          disableHoverListener={disableTooltip}
          disableTouchListener={disableTooltip}
        >
          <Fab
            className={[
              classes.buttonSmall,
              classes.buttonRed,
              classes.buttonWithHover,
            ].join(' ')}
            onClick={handleClick}
          >
            <AssignmentLateIcon fontSize="inherit" className={classes.icon} />
            <DoneIcon className={[classes.icon, classes.hoverIcon].join(' ')} />
          </Fab>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip
          title={`Due ${DateTime.fromISO(startAt).toRelative()}`}
          placement={tooltipPlacement}
          arrow
          disableFocusListener={disableTooltip}
          disableHoverListener={disableTooltip}
          disableTouchListener={disableTooltip}
        >
          <Fab
            className={[
              classes.buttonSmall,
              classes.buttonPrimary,
              classes.buttonWithHover,
            ].join(' ')}
            onClick={handleClick}
          >
            <AssignmentIcon fontSize="inherit" className={classes.icon} />
            <DoneIcon className={[classes.icon, classes.hoverIcon].join(' ')} />
          </Fab>
        </Tooltip>
      );
    }
  } else {
    return (
      <Tooltip
        title={t('No Due Date') ?? ''}
        placement={tooltipPlacement}
        arrow
        disableFocusListener={disableTooltip}
        disableHoverListener={disableTooltip}
        disableTouchListener={disableTooltip}
      >
        <Fab
          className={[
            classes.buttonSmall,
            color && classes.buttonPrimary,
            classes.buttonWithHover,
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={handleClick}
        >
          <AssignmentIcon fontSize="inherit" className={classes.icon} />
          <DoneIcon className={[classes.icon, classes.hoverIcon].join(' ')} />
        </Fab>
      </Tooltip>
    );
  }
};

export default TaskStatus;
