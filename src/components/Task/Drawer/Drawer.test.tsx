import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import GET_LOCAL_STATE_QUERY from '../../../queries/getLocalStateQuery.graphql';
import { getDataForTaskDrawerMock, createTaskMutationMock, updateTaskMutationMock } from './Form/Form.mock';
import {
    getCommentsForTaskDrawerCommentListEmptyMock,
    getCommentsForTaskDrawerCommentListMock,
} from './CommentList/CommentList.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getTaskForTaskDrawerMock } from './Drawer.mock';
import TaskDrawer from '.';

describe(TaskDrawer.name, () => {
    it('default', async () => {
        const onClose = jest.fn();
        const mocks = [
            getDataForTaskDrawerMock(),
            { ...createTaskMutationMock(), delay: 0 },
            getCommentsForTaskDrawerCommentListEmptyMock(),
        ];
        const cache = new InMemoryCache({ addTypename: false });
        cache.writeQuery({
            query: GET_LOCAL_STATE_QUERY,
            data: {
                currentAccountListId: 'abc',
                breadcrumb: null,
            },
        });
        const { getByText, getByRole } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                        <TaskDrawer onClose={onClose} />
                    </MockedProvider>
                </SnackbarProvider>
            </MuiPickersUtilsProvider>,
        );
        expect(getByRole('tab', { name: 'Contacts' })).toBeDisabled();
        expect(getByRole('tab', { name: 'Comments' })).toBeDisabled();
        expect(getByText('Add Task')).toBeInTheDocument();
        userEvent.type(getByRole('textbox', { name: 'Subject' }), 'abc');
        userEvent.click(getByText('Save'));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
    });

    it('persisted', async () => {
        const mocks = [
            getDataForTaskDrawerMock(),
            getContactsForTaskDrawerContactListMock(),
            getCommentsForTaskDrawerCommentListMock(),
            { ...updateTaskMutationMock(), delay: 0 },
            getTaskForTaskDrawerMock(),
        ];
        const cache = new InMemoryCache({ addTypename: false });
        cache.writeQuery({
            query: GET_LOCAL_STATE_QUERY,
            data: {
                currentAccountListId: 'abc',
                breadcrumb: null,
            },
        });
        const { getByText, getByRole, findByTestId, findByText } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
                        <TaskDrawer taskId="task-1" />
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
