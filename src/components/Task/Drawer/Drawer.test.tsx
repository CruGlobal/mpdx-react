import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../App';
import TestRouter from '../../../../tests/TestRouter';
import { getDataForTaskDrawerMock, createTaskMutationMock, updateTaskMutationMock } from './Form/Form.mock';
import { getCommentsForTaskDrawerCommentListMock } from './CommentList/CommentList.mock';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getTaskForTaskDrawerMock } from './Drawer.mock';
import TaskDrawer from '.';

describe(TaskDrawer.name, () => {
    it('default', async () => {
        const onClose = jest.fn();
        const mocks = [getDataForTaskDrawerMock(), createTaskMutationMock()];
        const { getByText, getByRole } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={mocks} addTypename={false}>
                        <AppProvider initialState={{ accountListId: 'abc' }}>
                            <TaskDrawer onClose={onClose} />
                        </AppProvider>
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
            updateTaskMutationMock(),
            getTaskForTaskDrawerMock(),
        ];
        const { getByText, getByRole, findByTestId, findByText } = render(
            <TestRouter>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <SnackbarProvider>
                        <MockedProvider mocks={mocks} addTypename={false}>
                            <AppProvider initialState={{ accountListId: 'abc' }}>
                                <TaskDrawer taskId="task-1" />
                            </AppProvider>
                        </MockedProvider>
                    </SnackbarProvider>
                </MuiPickersUtilsProvider>
            </TestRouter>,
        );
        expect(await findByTestId('TaskDrawerTitle')).toHaveTextContent('NEWSLETTER_EMAIL');
        userEvent.click(getByText('Save'));
        userEvent.click(getByRole('tab', { name: 'Contacts' }));
        expect(await findByText('Quinn, Anthony')).toBeInTheDocument();
    });
});
