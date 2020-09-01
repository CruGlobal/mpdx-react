import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ActivityTypeEnum, NotificationTimeUnitEnum, NotificationTypeEnum } from '../../../../../types/globalTypes';
import { getDataForTaskDrawerMock, createTaskMutationMock, updateTaskMutationMock } from './Form.mock';
import TaskDrawerForm from '.';

export default {
    title: 'Task/Drawer/Form',
};

export const Default = (): ReactElement => {
    return (
        <MockedProvider mocks={[getDataForTaskDrawerMock(), createTaskMutationMock()]} addTypename={false}>
            <TaskDrawerForm accountListId="abc" onClose={(): void => {}} />
        </MockedProvider>
    );
};

export const Persisted = (): ReactElement => {
    return (
        <MockedProvider mocks={[getDataForTaskDrawerMock(), updateTaskMutationMock()]} addTypename={false}>
            <TaskDrawerForm
                accountListId="abc"
                task={{
                    id: 'task-1',
                    activityType: ActivityTypeEnum.NEWSLETTER_EMAIL,
                    subject: 'On the Journey with the Johnson Family',
                    startAt: new Date(2012, 12, 5, 1, 2),
                    tagList: ['tag-1', 'tag-2'],
                    contacts: {
                        nodes: [
                            { id: 'def', name: 'Anderson, Robert' },
                            { id: 'ghi', name: 'Smith, John' },
                        ],
                    },
                    user: { id: 'def', firstName: 'Anderson', lastName: 'Robert' },
                    notificationTimeBefore: 20,
                    notificationType: NotificationTypeEnum.BOTH,
                    notificationTimeUnit: NotificationTimeUnitEnum.HOURS,
                }}
                onClose={(): void => {}}
            />
        </MockedProvider>
    );
};
