import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GetTaskForTaskDrawerQuery } from '../../../../types/GetTaskForTaskDrawerQuery';
import { ActivityTypeEnum, NotificationTypeEnum, NotificationTimeUnitEnum } from '../../../../types/globalTypes';
import { getDataForTaskDrawerMock } from './Form/Form.mock';
import { GET_TASK_FOR_TASK_DRAWER_QUERY } from './Drawer';
import { GetContactsForTaskDrawerContactListMocks } from './ContactList/ContactList.mock';
import { GetCommentsForTaskDrawerCommentListMocks } from './CommentList/CommentList.mock';
import TaskDrawer from '.';

export default {
    title: 'Task/Drawer',
};

export const Default = (): ReactElement => (
    <MockedProvider mocks={[getDataForTaskDrawerMock()]} addTypename={false}>
        <TaskDrawer accountListId="abc" />
    </MockedProvider>
);

export const Persisted = (): ReactElement => {
    const data: GetTaskForTaskDrawerQuery = {
        task: {
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
        },
    };

    const mocks = [
        {
            request: {
                query: GET_TASK_FOR_TASK_DRAWER_QUERY,
                variables: {
                    accountListId: 'abc',
                    taskId: 'task-1',
                },
            },
            result: {
                data,
            },
        },
        getDataForTaskDrawerMock(),
        ...GetContactsForTaskDrawerContactListMocks(),
        ...GetCommentsForTaskDrawerCommentListMocks(),
    ];

    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <TaskDrawer accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};
