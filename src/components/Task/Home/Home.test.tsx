import React from 'react';
import TestWrapper from '../../../../tests/TestWrapper';
import { getDataForTaskDrawerMock } from '../Drawer/Form/Form.mock';
import { render } from '../../../../tests/testingLibraryReactMock';
import { getTasksForTaskListMock, getFilteredTasksForTaskListMock } from '../List/List.mock';
import TaskHome from '.';

describe('TaskHome', () => {
    it('has correct defaults', async () => {
        const mocks = [getTasksForTaskListMock(), getDataForTaskDrawerMock()];
        const { findByText } = render(
            <TestWrapper mocks={mocks}>
                <TaskHome />
            </TestWrapper>,
        );
        expect(await findByText('On the Journey with the Johnson Family')).toBeInTheDocument();
    });

    it('has correct overrides', async () => {
        const filter = {
            activityType: ['APPOINTMENT'],
            completed: true,
            tags: ['tag-1', 'tag-2'],
            userIds: ['user-1'],
            contactIds: ['contact-1'],
            wildcardSearch: 'journey',
        };
        const { findByText } = render(
            <TestWrapper mocks={[getFilteredTasksForTaskListMock(filter), getDataForTaskDrawerMock()]}>
                <TaskHome initialFilter={filter} />
            </TestWrapper>,
        );
        expect(await findByText('On the Journey with the Johnson Family')).toBeInTheDocument();
    });
});
