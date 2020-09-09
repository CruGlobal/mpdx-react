import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { startOfHour, addHours } from 'date-fns';
import userEvent from '@testing-library/user-event';
import { ActivityTypeEnum, NotificationTypeEnum, NotificationTimeUnitEnum } from '../../../../../types/globalTypes';
import { getDataForTaskDrawerMock, createTaskMutationMock, updateTaskMutationMock } from './Form.mock';
import TaskDrawerForm from '.';

describe(TaskDrawerForm.name, () => {
    it('default', async () => {
        const onClose = jest.fn();
        const onChange = jest.fn();
        const { getByText, getByRole, findByText } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={[getDataForTaskDrawerMock(), createTaskMutationMock()]} addTypename={false}>
                        <TaskDrawerForm accountListId="abc" onClose={onClose} onChange={onChange} />
                    </MockedProvider>
                </SnackbarProvider>
            </MuiPickersUtilsProvider>,
        );
        userEvent.click(getByText('Cancel'));
        expect(onClose).toHaveBeenCalled();
        onClose.mockClear();
        userEvent.click(getByText('Save'));
        expect(await findByText('Field is required')).toBeInTheDocument();
        userEvent.type(getByRole('textbox', { name: 'Subject' }), 'abc');
        userEvent.click(getByRole('checkbox', { name: 'Notification' }));
        userEvent.type(getByRole('spinbutton', { name: 'Period' }), '20');
        userEvent.click(getByRole('checkbox', { name: 'Notification' }));
        await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
        userEvent.click(getByText('Save'));
        await waitFor(() => expect(onChange).toHaveBeenCalled());
        expect(onChange).toHaveBeenCalledWith({
            activityType: null,
            contacts: {
                nodes: [],
            },
            id: 'task-1',
            notificationTimeBefore: null,
            notificationTimeUnit: null,
            notificationType: null,
            startAt: startOfHour(addHours(new Date(), 1)),
            completedAt: null,
            subject: 'abc',
            tagList: [],
            user: null,
        });
        expect(onClose).toHaveBeenCalled();
    });

    it('persisted', async () => {
        const onClose = jest.fn();
        const onChange = jest.fn();
        const { getByText, getByRole } = render(
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <SnackbarProvider>
                    <MockedProvider mocks={[getDataForTaskDrawerMock(), updateTaskMutationMock()]} addTypename={false}>
                        <TaskDrawerForm
                            accountListId="abc"
                            onClose={onClose}
                            onChange={onChange}
                            task={{
                                activityType: null,
                                contacts: {
                                    nodes: [],
                                },
                                id: 'task-1',
                                notificationTimeBefore: null,
                                notificationTimeUnit: null,
                                notificationType: null,
                                startAt: new Date(2012, 12, 5, 1, 2),
                                completedAt: null,
                                subject: '',
                                tagList: [],
                                user: null,
                            }}
                        />
                    </MockedProvider>
                </SnackbarProvider>
            </MuiPickersUtilsProvider>,
        );
        userEvent.click(getByRole('button', { name: 'Type' }));
        userEvent.click(within(getByRole('listbox', { name: 'Type' })).getByText('NEWSLETTER_EMAIL'));

        userEvent.type(getByRole('textbox', { name: 'Subject' }), 'On the Journey with the Johnson Family');

        const tagsElement = getByRole('textbox', { name: 'Tags' });
        userEvent.click(tagsElement);
        userEvent.click(await within(getByRole('presentation')).findByText('tag-1'));
        userEvent.click(tagsElement);
        userEvent.click(within(getByRole('presentation')).getByText('tag-2'));

        const assigneeElement = getByRole('textbox', { name: 'Assignee' });
        userEvent.click(assigneeElement);
        userEvent.click(await within(getByRole('presentation')).findByText('Robert Anderson'));

        const contactsElement = getByRole('textbox', { name: 'Contacts' });
        userEvent.click(contactsElement);
        userEvent.click(await within(getByRole('presentation')).findByText('Anderson, Robert'));
        userEvent.click(contactsElement);
        userEvent.click(within(getByRole('presentation')).getByText('Smith, John'));

        userEvent.click(getByRole('checkbox', { name: 'Notification' }));
        userEvent.type(getByRole('spinbutton', { name: 'Period' }), '20');
        userEvent.click(getByRole('button', { name: 'Unit' }));
        userEvent.click(within(getByRole('listbox', { name: 'Unit' })).getByText('HOURS'));
        userEvent.click(getByRole('button', { name: 'Platform' }));
        userEvent.click(within(getByRole('listbox', { name: 'Platform' })).getByText('BOTH'));

        userEvent.click(getByText('Save'));
        await waitFor(() => expect(onChange).toHaveBeenCalled());
        expect(onChange).toHaveBeenCalledWith({
            id: 'task-1',
            activityType: ActivityTypeEnum.NEWSLETTER_EMAIL,
            subject: 'On the Journey with the Johnson Family',
            startAt: new Date(2012, 12, 5, 1, 2),
            completedAt: null,
            tagList: ['tag-1', 'tag-2'],
            contacts: {
                nodes: [
                    { id: 'contact-1', name: 'Anderson, Robert' },
                    { id: 'contact-2', name: 'Smith, John' },
                ],
            },
            user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' },
            notificationTimeBefore: 20,
            notificationType: NotificationTypeEnum.BOTH,
            notificationTimeUnit: NotificationTimeUnitEnum.HOURS,
        });
        expect(onClose).toHaveBeenCalled();
    });
});
