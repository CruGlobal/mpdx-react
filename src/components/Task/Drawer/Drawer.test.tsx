import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import userEvent from '@testing-library/user-event';
import { getDataForTaskDrawerMock, createTaskMutationMock, updateTaskMutationMock } from './Form/Form.mock';
import {
    getCommentsForTaskDrawerCommentListEmptyMock,
    getCommentsForTaskDrawerCommentListMock,
} from './CommentList/CommentList.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import getTaskForTaskDrawerMock from './Drawer.mock';
import TaskDrawer from '.';

describe(TaskDrawer.name, () => {
    it('default', async () => {
        const mocks = [
            getDataForTaskDrawerMock(),
            { ...createTaskMutationMock(), delay: 0 },
            getCommentsForTaskDrawerCommentListEmptyMock(),
        ];
        const { getByText, getByRole, findByText, queryByText } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <TaskDrawer accountListId="abc" />
                    </MockedProvider>
                </SnackbarProvider>
            </MuiPickersUtilsProvider>,
        );
        expect(getByRole('tab', { name: 'Contacts' })).toBeDisabled();
        expect(getByRole('tab', { name: 'Comments' })).toBeDisabled();
        expect(getByText('Add Task')).toBeInTheDocument();
        userEvent.click(getByText('Save'));
        await waitFor(() => expect(getByRole('tab', { name: 'Contacts' })).not.toBeDisabled());
        expect(getByText('Task')).toBeInTheDocument();
        userEvent.click(getByRole('tab', { name: 'Comments' }));
        expect(await findByText('No Comments to show.')).toBeInTheDocument();
        userEvent.click(getByRole('button', { name: 'Close' }));
        await waitFor(() => expect(queryByText('Task')).not.toBeInTheDocument());
    });

    it('persisted', async () => {
        const mocks = [
            getDataForTaskDrawerMock(),
            getContactsForTaskDrawerContactListMock(),
            getCommentsForTaskDrawerCommentListMock(),
            { ...updateTaskMutationMock(), delay: 0 },
            getTaskForTaskDrawerMock(),
        ];
        const { getByText, getByRole, findByTestId, findByText } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <TaskDrawer accountListId="abc" taskId="task-1" />
                    </MockedProvider>
                </SnackbarProvider>
            </MuiPickersUtilsProvider>,
        );
        expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent('NEWSLETTER_EMAIL');
        userEvent.click(getByText('Save'));
        userEvent.click(getByRole('tab', { name: 'Contacts' }));
        expect(await findByText('Quinn, Anthony')).toBeInTheDocument();
    });
});
