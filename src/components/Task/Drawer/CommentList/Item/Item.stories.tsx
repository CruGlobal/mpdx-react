import React, { ReactElement } from 'react';
import { Box } from '@material-ui/core';
import { GetCommentsForTaskDrawerCommentListQuery_task_comments_nodes as Comment } from '../../../../../../types/GetCommentsForTaskDrawerCommentListQuery';
import TaskDrawerCommentListItem from '.';

export default {
    title: 'Task/Drawer/CommentList/Item',
};

const comment: Comment = {
    id: 'def',
    body:
        'The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. ' +
        'The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. ' +
        'The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. ' +
        'The quick brown fox jumped over the lazy dog. The quick brown fox jumped over the lazy dog. ',
    createdAt: '2019-10-12',
    me: false,
    person: {
        id: 'person-a',
        firstName: 'Bob',
        lastName: 'Jones',
    },
};

export const Default = (): ReactElement => {
    return (
        <Box m={2}>
            <TaskDrawerCommentListItem comment={comment} />
        </Box>
    );
};

export const Loading = (): ReactElement => {
    return (
        <Box m={2}>
            <TaskDrawerCommentListItem />
        </Box>
    );
};

export const User = (): ReactElement => {
    return (
        <Box m={2}>
            <TaskDrawerCommentListItem comment={comment} reverse={true} />
        </Box>
    );
};
