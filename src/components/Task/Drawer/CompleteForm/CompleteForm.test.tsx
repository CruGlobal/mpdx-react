import React from 'react';
import { render, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDataForTaskDrawerMock } from '../Form/Form.mock';
import TestWrapper from '../../../../../tests/TestWrapper';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
    ActivityTypeEnum,
    NotificationTypeEnum,
    NotificationTimeUnitEnum,
    ResultEnum,
} from '../../../../../types/globalTypes';
import { AppProviderContext } from '../../../App/Provider';
import { completeTaskMutationMock, completeSimpleTaskMutationMock } from './CompleteForm.mock';
import TaskDrawerCompleteForm from '.';

const openTaskDrawer = jest.fn();

jest.mock('../../../App', () => ({
    useApp: (): Partial<AppProviderContext> => ({
        openTaskDrawer,
    }),
}));

describe('TaskDrawerCompleteForm', () => {
    const task = {
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
        user: { id: 'user-1', firstName: 'Anderson', lastName: 'Robert' },
        notificationTimeBefore: 20,
        notificationType: NotificationTypeEnum.BOTH,
        notificationTimeUnit: NotificationTimeUnitEnum.HOURS,
    };

    beforeEach(() => {
        openTaskDrawer.mockClear();
    });

    it('default', async () => {
        const { getAllByRole } = render(
            <TestWrapper mocks={[getDataForTaskDrawerMock(), completeTaskMutationMock()]} disableAppProvider>
                <TaskDrawerCompleteForm accountListId="abc" onClose={jest.fn()} task={task} />
            </TestWrapper>,
        );
        const dateString = dateFormat(new Date());
        expect(getAllByRole('textbox').find((item: HTMLInputElement) => item.value === dateString)).toBeInTheDocument();
    });

    it('saves simple', async () => {
        const onClose = jest.fn();
        const { getByText } = render(
            <TestWrapper mocks={[getDataForTaskDrawerMock(), completeSimpleTaskMutationMock()]} disableAppProvider>
                <TaskDrawerCompleteForm
                    accountListId="abc"
                    onClose={onClose}
                    task={{ ...task, activityType: null, completedAt: new Date(2015, 12, 5, 1, 2) }}
                />
            </TestWrapper>,
        );
        userEvent.click(getByText('Save'));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(openTaskDrawer).not.toHaveBeenCalled();
    });

    it('saves complex', async () => {
        const onClose = jest.fn();
        const { getByRole, getByText } = render(
            <TestWrapper mocks={[getDataForTaskDrawerMock(), completeTaskMutationMock()]} disableAppProvider>
                <TaskDrawerCompleteForm
                    accountListId="abc"
                    onClose={onClose}
                    task={{
                        ...task,
                        activityType: ActivityTypeEnum.CALL,
                        completedAt: new Date(2015, 12, 5, 1, 2),
                        tagList: [],
                    }}
                />
            </TestWrapper>,
        );
        userEvent.click(getByRole('button', { name: 'Result' }));
        userEvent.click(within(getByRole('listbox', { name: 'Result' })).getByText('COMPLETED'));
        userEvent.click(getByRole('button', { name: 'Next Action' }));
        userEvent.click(within(getByRole('listbox', { name: 'Next Action' })).getByText('APPOINTMENT'));
        const tagsElement = getByRole('textbox', { name: 'Tags' });
        userEvent.click(tagsElement);
        userEvent.click(await within(getByRole('presentation')).findByText('tag-1'));
        userEvent.click(tagsElement);
        userEvent.click(within(getByRole('presentation')).getByText('tag-2'));
        userEvent.click(getByText('Save'));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(openTaskDrawer).toHaveBeenCalledWith({
            defaultValues: {
                activityType: ActivityTypeEnum.APPOINTMENT,
                contacts: {
                    nodes: [
                        { id: 'contact-1', name: 'Anderson, Robert' },
                        { id: 'contact-2', name: 'Smith, John' },
                    ],
                },
                user: { id: 'user-1', firstName: 'Anderson', lastName: 'Robert' },
            },
        });
    });

    const getOptions = (activityType: ActivityTypeEnum): { results: ResultEnum[]; nextActions: ActivityTypeEnum[] } => {
        const { getByRole, queryByRole } = render(
            <TestWrapper mocks={[getDataForTaskDrawerMock()]} disableAppProvider>
                <TaskDrawerCompleteForm
                    accountListId="abc"
                    onClose={jest.fn()}
                    task={{
                        ...task,
                        activityType,
                    }}
                />
            </TestWrapper>,
        );
        let results = [];
        if (queryByRole('button', { name: 'Result' })) {
            userEvent.click(getByRole('button', { name: 'Result' }));
            results = within(getByRole('listbox', { name: 'Result' }))
                .getAllByRole('option')
                .map((option) => ResultEnum[option.textContent]);
            userEvent.click(getByRole('option', { name: 'NONE' }));
        }
        let nextActions = [];
        if (queryByRole('button', { name: 'Next Action' })) {
            userEvent.click(getByRole('button', { name: 'Next Action' }));
            nextActions = within(getByRole('listbox', { name: 'Next Action' }))
                .getAllByRole('option')
                .map((option) => ActivityTypeEnum[option.textContent]);
        }
        return { results, nextActions };
    };

    it('has correct options for APPOINTMENT', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.APPOINTMENT);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.ATTEMPTED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for CALL', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.CALL);
        expect(results).toEqual([
            ResultEnum.NONE,
            ResultEnum.COMPLETED,
            ResultEnum.ATTEMPTED,
            ResultEnum.ATTEMPTED_LEFT_MESSAGE,
            ResultEnum.RECEIVED,
        ]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.APPOINTMENT,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for EMAIL', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.EMAIL);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.APPOINTMENT,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for FACEBOOK_MESSAGE', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.FACEBOOK_MESSAGE);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.APPOINTMENT,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for LETTER', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.LETTER);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
        ]);
    });

    it('has correct options for NEWSLETTER_EMAIL', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.NEWSLETTER_EMAIL);
        expect(results).toEqual([]);
        expect(nextActions).toEqual([]);
    });

    it('has correct options for NEWSLETTER_PHYSICAL', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.NEWSLETTER_PHYSICAL);
        expect(results).toEqual([]);
        expect(nextActions).toEqual([]);
    });

    it('has correct options for NONE', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.NONE);
        expect(results).toEqual([]);
        expect(nextActions).toEqual([]);
    });

    it('has correct options for PRAYER_REQUEST', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.PRAYER_REQUEST);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.APPOINTMENT,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for PRE_CALL_LETTER', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.PRE_CALL_LETTER);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
        ]);
    });

    it('has correct options for REMINDER_LETTER', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.REMINDER_LETTER);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
        ]);
    });

    it('has correct options for SUPPORT_LETTER', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.SUPPORT_LETTER);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
        ]);
    });

    it('has correct options for TALK_TO_IN_PERSON', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.TALK_TO_IN_PERSON);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.APPOINTMENT,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for TEXT_MESSAGE', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.TEXT_MESSAGE);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
            ActivityTypeEnum.APPOINTMENT,
            ActivityTypeEnum.PRAYER_REQUEST,
            ActivityTypeEnum.THANK,
        ]);
    });

    it('has correct options for THANK', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.THANK);
        expect(results).toEqual([ResultEnum.NONE, ResultEnum.COMPLETED, ResultEnum.RECEIVED]);
        expect(nextActions).toEqual([
            ActivityTypeEnum.NONE,
            ActivityTypeEnum.CALL,
            ActivityTypeEnum.EMAIL,
            ActivityTypeEnum.TEXT_MESSAGE,
            ActivityTypeEnum.FACEBOOK_MESSAGE,
            ActivityTypeEnum.TALK_TO_IN_PERSON,
        ]);
    });

    it('has correct options for TO_DO', () => {
        const { results, nextActions } = getOptions(ActivityTypeEnum.TO_DO);
        expect(results).toEqual([]);
        expect(nextActions).toEqual([]);
    });

    it('has correct options for null', () => {
        const { results, nextActions } = getOptions(null);
        expect(results).toEqual([]);
        expect(nextActions).toEqual([]);
    });
});
