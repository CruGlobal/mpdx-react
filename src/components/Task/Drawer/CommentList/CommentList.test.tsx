import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import {
    getCommentsForTaskDrawerCommentListMock,
    getCommentsForTaskDrawerCommentListEmptyMock,
    getCommentsForTaskDrawerCommentListLoadingMock,
} from './CommentList.mock';
import TaskDrawerCommentList from '.';

describe(TaskDrawerCommentList.name, () => {
    it('default', async () => {
        const { queryByTestId, getAllByTestId } = render(
            <MockedProvider mocks={[getCommentsForTaskDrawerCommentListMock()]} addTypename={false}>
                <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('TaskDrawerCommentListLoading')).not.toBeInTheDocument());
        expect(
            getAllByTestId(/TaskDrawerCommentListItem-comment-./).map((element) => element.getAttribute('data-testid')),
        ).toEqual([
            'TaskDrawerCommentListItem-comment-1',
            'TaskDrawerCommentListItem-comment-2',
            'TaskDrawerCommentListItem-comment-3',
        ]);
    });

    it('loading', () => {
        const { getByTestId } = render(
            <MockedProvider mocks={[getCommentsForTaskDrawerCommentListLoadingMock()]} addTypename={false}>
                <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
            </MockedProvider>,
        );
        expect(getByTestId('TaskDrawerCommentListLoading')).toBeInTheDocument();
    });

    it('empty', async () => {
        const { queryByTestId, getByTestId } = render(
            <MockedProvider mocks={[getCommentsForTaskDrawerCommentListEmptyMock()]} addTypename={false}>
                <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
            </MockedProvider>,
        );
        await waitFor(() => expect(queryByTestId('TaskDrawerCommentListLoading')).not.toBeInTheDocument());
        expect(getByTestId('TaskDrawerCommentListEmpty')).toBeInTheDocument();
    });
});
