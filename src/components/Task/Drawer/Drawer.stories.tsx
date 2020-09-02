import React, { ReactElement } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { GetTaskForTaskDrawerQuery } from '../../../../types/GetTaskForTaskDrawerQuery';
import { ActivityTypeEnum, NotificationTypeEnum, NotificationTimeUnitEnum } from '../../../../types/globalTypes';
import { getDataForTaskDrawerMock, updateTaskMutationMock, createTaskMutationMock } from './Form/Form.mock';
import { GET_TASK_FOR_TASK_DRAWER_QUERY } from './Drawer';
import { getContactsForTaskDrawerContactListMock } from './ContactList/ContactList.mock';
import { getCommentsForTaskDrawerCommentListMock } from './CommentList/CommentList.mock';
import TaskDrawer from '.';

export default {
    title: 'Task/Drawer',
};

export const Default = (): ReactElement => (
    <MockedProvider mocks={[getDataForTaskDrawerMock(), createTaskMutationMock()]} addTypename={false}>
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
                    { id: 'contact-1', name: 'Anderson, Robert' },
                    { id: 'contact-2', name: 'Smith, John' },
                ],
            },
            user: { id: 'user-1', firstName: 'Anderson', lastName: 'Robert' },
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
        getContactsForTaskDrawerContactListMock(),
        getCommentsForTaskDrawerCommentListMock(),
        updateTaskMutationMock(),
    ];

    return (
        <MockedProvider mocks={mocks} addTypename={false}>
            <TaskDrawer accountListId="abc" taskId="task-1" />
        </MockedProvider>
    );
};
