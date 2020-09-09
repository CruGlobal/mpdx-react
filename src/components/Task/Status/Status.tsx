import React, { ReactElement } from 'react';
import { Tooltip, Theme, makeStyles, Fab } from '@material-ui/core';
import { isPast, formatDistanceToNow } from 'date-fns';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import { green, orange } from '@material-ui/core/colors';
import { useTranslation } from 'react-i18next';
import { compact } from 'lodash/fp';
import DoneIcon from '@material-ui/icons/Done';
import { useApp } from '../../App';

const useStyles = makeStyles((theme: Theme) => ({
    buttonGreen: {
        color: '#fff',
        backgroundColor: green[500],
        cursor: 'default',
        '&:hover': {
            backgroundColor: green[500],
        },
    },
    buttonOrange: {
        color: '#fff',
        backgroundColor: orange[500],
    },
    buttonPrimary: {
        color: '#fff',
        backgroundColor: theme.palette.primary.main,
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
            backgroundColor: green[500],
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
        color: '#fff',
    },
}));

interface Props {
    taskId?: string;
    startAt?: string;
    completedAt?: string;
    color?: 'primary';
    disableTooltip?: boolean;
}

const TaskStatus = ({ taskId, startAt, completedAt, color, disableTooltip = false }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const { openTaskCompletedDrawer } = useApp();
    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        taskId && openTaskCompletedDrawer(taskId);
        event.stopPropagation();
    };

    if (completedAt) {
        return (
            <Tooltip
                title={`Completed ${formatDistanceToNow(new Date(completedAt), { addSuffix: true })}`}
                placement="right"
                arrow
                disableFocusListener={disableTooltip}
                disableHoverListener={disableTooltip}
                disableTouchListener={disableTooltip}
            >
                <Fab className={[classes.buttonSmall, classes.buttonGreen].join(' ')}>
                    <AssignmentTurnedInIcon fontSize="inherit" className={classes.icon} />
                </Fab>
            </Tooltip>
        );
    } else if (startAt) {
        if (isPast(new Date(startAt))) {
            return (
                <Tooltip
                    title={`Overdue ${formatDistanceToNow(new Date(startAt), {
                        addSuffix: true,
                    })}`}
                    placement="right"
                    arrow
                    disableFocusListener={disableTooltip}
                    disableHoverListener={disableTooltip}
                    disableTouchListener={disableTooltip}
                >
                    <Fab
                        className={[classes.buttonSmall, classes.buttonOrange, classes.buttonWithHover].join(' ')}
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
                    title={`Due in ${formatDistanceToNow(new Date(startAt), {
                        addSuffix: true,
                    })}`}
                    placement="right"
                    arrow
                    disableFocusListener={disableTooltip}
                    disableHoverListener={disableTooltip}
                    disableTouchListener={disableTooltip}
                >
                    <Fab
                        className={[classes.buttonSmall, classes.buttonPrimary, classes.buttonWithHover].join(' ')}
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
                title={t('No Due Date')}
                placement="right"
                arrow
                disableFocusListener={disableTooltip}
                disableHoverListener={disableTooltip}
                disableTouchListener={disableTooltip}
            >
                <Fab
                    className={compact([
                        classes.buttonSmall,
                        color && classes.buttonPrimary,
                        classes.buttonWithHover,
                    ]).join(' ')}
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
