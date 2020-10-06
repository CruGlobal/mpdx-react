import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import {
    getCommentsForTaskDrawerCommentListMock,
    getCommentsForTaskDrawerCommentListEmptyMock,
    getCommentsForTaskDrawerCommentListLoadingMock,
} from './CommentList.mock';
import { createTaskCommentMutationMock } from './Form/Form.mock';
import TaskDrawerCommentList from '.';

jest.mock('uuid', () => ({
    v4: (): string => 'comment-0',
}));

describe('TaskDrawerCommentList', () => {
    it('default', async () => {
        const { queryByTestId, getAllByTestId, getByRole } = render(
            <TestWrapper
                initialState={{ user: { id: 'user-1', firstName: 'John', lastName: 'Smith' } }}
                mocks={[getCommentsForTaskDrawerCommentListMock(), createTaskCommentMutationMock()]}
            >
                <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
            </TestWrapper>,
        );
        await waitFor(() => expect(queryByTestId('TaskDrawerCommentListLoading')).not.toBeInTheDocument());
        userEvent.type(getByRole('textbox'), 'comment{enter}');
        await waitFor(() => expect(getByRole('textbox')).toHaveValue(''));
        expect(
            getAllByTestId(/TaskDrawerCommentListItem-comment-./).map((element) => element.getAttribute('data-testid')),
        ).toEqual([
            'TaskDrawerCommentListItem-comment-1',
            'TaskDrawerCommentListItem-comment-2',
            'TaskDrawerCommentListItem-comment-3',
            'TaskDrawerCommentListItem-comment-4',
            'TaskDrawerCommentListItem-comment-5',
            'TaskDrawerCommentListItem-comment-6',
            'TaskDrawerCommentListItem-comment-0',
        ]);
    });

    it('loading', () => {
        const { getByTestId } = render(
            <TestWrapper
                initialState={{ user: { id: 'user-1', firstName: 'John', lastName: 'Smith' } }}
                mocks={[getCommentsForTaskDrawerCommentListLoadingMock()]}
            >
                <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
            </TestWrapper>,
        );
        expect(getByTestId('TaskDrawerCommentListLoading')).toBeInTheDocument();
    });

    it('empty', async () => {
        const { queryByTestId, getByTestId } = render(
            <TestWrapper
                initialState={{ user: { id: 'user-1', firstName: 'John', lastName: 'Smith' } }}
                mocks={[getCommentsForTaskDrawerCommentListEmptyMock()]}
            >
                <TaskDrawerCommentList accountListId="abc" taskId="task-1" />
            </TestWrapper>,
        );
        await waitFor(() => expect(queryByTestId('TaskDrawerCommentListLoading')).not.toBeInTheDocument());
        expect(getByTestId('TaskDrawerCommentListEmpty')).toBeInTheDocument();
    });
});
