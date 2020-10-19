import React from 'react';
import MockDate from 'mockdate';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { getDataForTaskDrawerMock } from '../Drawer/Form/Form.mock';
import { AppProviderContext } from '../../App/Provider';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import { getTasksForTaskListMock, getFilteredTasksForTaskListMock, getEmptyTasksForTaskListMock } from './List.mock';
import TaskList from '.';

const openTaskDrawer = jest.fn();

jest.mock('../../App', () => ({
    useApp: (): Partial<AppProviderContext> => ({
        openTaskDrawer,
        state: { accountListId: 'abc', breadcrumb: 'Tasks' },
    }),
}));

jest.mock('lodash/fp/debounce', () => jest.fn().mockImplementation((_time, fn) => fn));

describe('TaskList', () => {
    beforeEach(() => {
        MockDate.set(new Date('2020-09-01'));
    });

    afterEach(() => {
        MockDate.reset();
    });

    it('has correct defaults', async () => {
        const mocks = [
            getTasksForTaskListMock(),
            getDataForTaskDrawerMock(),
            getFilteredTasksForTaskListMock({ completed: false }),
            getFilteredTasksForTaskListMock({ activityType: ['APPOINTMENT'], completed: false }),
            getFilteredTasksForTaskListMock({
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
            }),
            getFilteredTasksForTaskListMock({
                tags: ['tag-1'],
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
            }),
            getFilteredTasksForTaskListMock({
                userIds: ['user-1'],
                tags: ['tag-1'],
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
            }),
            getFilteredTasksForTaskListMock({
                userIds: ['user-1'],
                tags: ['tag-1'],
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
                wildcardSearch: 'a',
            }),
            getFilteredTasksForTaskListMock({
                userIds: ['user-1'],
                tags: ['tag-1'],
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
                wildcardSearch: 'a',
                first: 250,
            }),
            getFilteredTasksForTaskListMock({
                userIds: ['user-1'],
                tags: ['tag-1'],
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
                wildcardSearch: 'a',
                first: 250,
                after: 'B',
            }),
            getFilteredTasksForTaskListMock({
                userIds: ['user-1'],
                tags: ['tag-1'],
                contactIds: ['contact-1'],
                activityType: ['APPOINTMENT'],
                completed: false,
                wildcardSearch: 'a',
                first: 250,
                before: 'A',
            }),
        ];
        const { findByText, getByRole, getAllByRole } = render(
            <TestWrapper mocks={mocks} disableAppProvider>
                <TaskList />
            </TestWrapper>,
        );
        userEvent.click(await findByText('On the Journey with the Johnson Family'));
        expect(openTaskDrawer).toHaveBeenCalledWith({ taskId: 'task-1' });
        userEvent.click(getByRole('button', { name: 'Filter Table' }));
        const buttons = getAllByRole('button').filter((element) => element.id);
        const buttonWithIdThatEndsWith = (value): HTMLElement => buttons.find((element) => element.id.endsWith(value));
        userEvent.click(buttonWithIdThatEndsWith('completedAt'));
        userEvent.click(getByRole('option', { name: 'Incomplete' }));
        userEvent.click(buttonWithIdThatEndsWith('activityType'));
        userEvent.click(getByRole('option', { name: 'Appointment' }));
        userEvent.tab();
        userEvent.click(buttonWithIdThatEndsWith('contacts'));
        userEvent.click(getByRole('option', { name: 'Anderson, Robert' }));
        userEvent.tab();
        userEvent.click(buttonWithIdThatEndsWith('tagList'));
        userEvent.click(getByRole('option', { name: 'tag-1' }));
        userEvent.tab();
        userEvent.click(buttonWithIdThatEndsWith('user'));
        userEvent.click(getByRole('option', { name: 'Robert Anderson' }));
        userEvent.tab();
        userEvent.click(getByRole('button', { name: 'Close' }));
        userEvent.click(getByRole('button', { name: 'Search' }));
        userEvent.type(getByRole('textbox', { name: 'Search' }), 'a');
        userEvent.click(getByRole('button', { name: 'Rows per page: 100' }));
        userEvent.click(getByRole('option', { name: '250' }));
        userEvent.click(getByRole('button', { name: 'Next Page' }));
        userEvent.click(getByRole('button', { name: 'Previous Page' }));
    });

    it('has correct overrides', async () => {
        const filter = {
            activityType: ['APPOINTMENT'],
            completed: true,
            tags: ['tag-1', 'tag-2'],
            userIds: ['user-1'],
            contactIds: ['contact-1'],
            wildcardSearch: 'journey',
            startAt: { min: '2020-10-10', max: '2020-12-10' },
        };
        const { getByRole, getByText, findByText } = render(
            <TestWrapper
                mocks={[getFilteredTasksForTaskListMock(filter), getDataForTaskDrawerMock()]}
                disableAppProvider
            >
                <TaskList initialFilter={filter} />
            </TestWrapper>,
        );
        expect(getByText('Appointment')).toBeInTheDocument();
        expect(getByText('Complete')).toBeInTheDocument();
        expect(getByText('Tag: tag-1')).toBeInTheDocument();
        expect(getByText('Tag: tag-2')).toBeInTheDocument();
        expect(getByText('Minimum Due Date: Oct 10, 2020')).toBeInTheDocument();
        expect(getByText('Maximum Due Date: Dec 10, 2020')).toBeInTheDocument();
        expect(getByRole('textbox')).toHaveValue('journey');
        expect(await findByText('Anderson, Robert')).toBeInTheDocument();
        expect(getByText('Robert Anderson')).toBeInTheDocument();
    });

    it('has loading state', () => {
        const mocks = [
            { ...getDataForTaskDrawerMock(), delay: 100931731455 },
            {
                ...getFilteredTasksForTaskListMock({
                    userIds: ['user-1'],
                    contactIds: ['contact-1'],
                }),
                delay: 100931731455,
            },
        ];
        const { getAllByRole } = render(
            <TestWrapper mocks={mocks} disableAppProvider>
                <TaskList
                    initialFilter={{
                        userIds: ['user-1'],
                        contactIds: ['contact-1'],
                    }}
                />
            </TestWrapper>,
        );
        expect(getAllByRole('button', { name: 'Loading' }).length).toEqual(2);
    });

    it('has empty state', () => {
        const { queryByTestId } = render(
            <TestWrapper mocks={[getEmptyTasksForTaskListMock(), getDataForTaskDrawerMock()]} disableAppProvider>
                <TaskList />
            </TestWrapper>,
        );
        expect(queryByTestId('TaskDrawerCommentListItemAvatar')).not.toBeInTheDocument();
    });
});
