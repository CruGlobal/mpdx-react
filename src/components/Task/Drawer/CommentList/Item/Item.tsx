import React, { ReactElement } from 'react';
import { makeStyles, Theme, Avatar, Typography, Box, Tooltip } from '@material-ui/core';
import { formatDistanceToNow } from 'date-fns';
import { compact } from 'lodash/fp';
import { Skeleton } from '@material-ui/lab';
import { GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes as Comment } from '../../../../../../types/GetCommentsForTaskDrawerCommentListQuery';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: '40px 5px 1fr',
        alignItems: 'end',
        marginBottom: theme.spacing(2),
    },
    triangle: {
        width: '0',
        height: '0',
        borderTop: '5px solid transparent',
        borderRight: `5px solid ${theme.palette.divider}`,
    },
    box: {
        display: 'inline-block',
        backgroundColor: theme.palette.divider,
        padding: theme.spacing(2),
        borderRadius: '8px',
        borderBottomLeftRadius: 0,
        maxWidth: '80%',
    },
    typography: {
        gridColumn: 3,
        display: 'flex',
    },
    avatar: {},
    content: {},
    reverse: {
        gridTemplateColumns: '1fr 5px',
        '& $avatar': {
            display: 'none',
        },
        '& $triangle': {
            gridColumn: 2,
            gridRow: 1,
            borderLeft: `5px solid ${theme.palette.primary.main}`,
            borderRight: 0,
        },
        '& $content': {
            gridColumn: 1,
            gridRow: 1,
            textAlign: 'right',
        },
        '& $box': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderBottomLeftRadius: '8px',
            borderBottomRightRadius: 0,
        },
        '& $typography': {
            gridColumn: 1,
            justifyContent: 'flex-end',
        },
    },
}));

interface Props {
    comment?: Comment;
    reverse?: boolean;
}

const TaskDrawerCommentListItem = ({ comment, reverse }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <Box className={compact([classes.container, reverse && classes.reverse]).join(' ')}>
            {comment ? (
                <Tooltip title={`${comment.person.firstName} ${comment.person.lastName}`} placement="right">
                    <Avatar className={classes.avatar}>{comment.person.firstName[0]}</Avatar>
                </Tooltip>
            ) : (
                <Skeleton className={classes.avatar} variant="circle" width={40} height={40} />
            )}
            <Box className={classes.triangle}></Box>
            <Box className={classes.content}>
                <Box className={classes.box}>
                    {comment ? (
                        <Typography>{comment.body}</Typography>
                    ) : (
                        <>
                            <Skeleton width={100} />
                            <Skeleton width={80} />
                        </>
                    )}
                </Box>
            </Box>
            <Typography className={classes.typography} color="textSecondary" variant="caption" component="div">
                {comment ? (
                    formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                ) : (
                    <Skeleton width={60} />
                )}
            </Typography>
        </Box>
    );
};

export default TaskDrawerCommentListItem;
