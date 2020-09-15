import { MockedResponse } from '@apollo/client/testing';
import {
    CompleteTaskMutation,
    CompleteTaskMutation_updateTask_task as Task,
} from '../../../../../types/CompleteTaskMutation';
import {
    ResultEnum,
    ActivityTypeEnum,
    TaskUpdateInput,
    NotificationTypeEnum,
    NotificationTimeUnitEnum,
} from '../../../../../types/globalTypes';
import { GetTaskForTaskDrawerQuery } from '../../../../../types/GetTaskForTaskDrawerQuery';
import { GET_TASK_FOR_TASK_DRAWER_QUERY } from '../Drawer';
import { COMPLETE_TASK_MUTATION } from './CompleteForm';

export const getCompleteTaskForTaskDrawerMock = (): MockedResponse => {
    const data: GetTaskForTaskDrawerQuery = {
        task: {
            id: 'task-1',
            activityType: ActivityTypeEnum.NEWSLETTER_EMAIL,
            subject: 'On the Journey with the Johnson Family',
            startAt: new Date(2012, 12, 5, 1, 2),
            completedAt: new Date(2015, 12, 5, 1, 2),
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
    return {
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
    };
};
export const completeSimpleTaskMutationMock = (): MockedResponse => {
    const task: Task = {
        id: 'task-1',
        completedAt: new Date(2015, 12, 5, 1, 2),
        tagList: ['tag-1', 'tag-2'],
        result: ResultEnum.NONE,
        nextAction: null,
    };
    const attributes: TaskUpdateInput = {
        id: 'task-1',
        completedAt: new Date(2015, 12, 5, 1, 2),
        tagList: ['tag-1', 'tag-2'],
        result: ResultEnum.NONE,
    };
    console.log(attributes);
    const data: CompleteTaskMutation = {
        updateTask: {
            task,
        },
    };
    return {
        request: {
            query: COMPLETE_TASK_MUTATION,
            variables: {
                accountListId: 'abc',
                attributes,
            },
        },
        result: { data },
    };
};
export const completeTaskMutationMock = (): MockedResponse => {
    const task: Task = {
        id: 'task-1',
        completedAt: new Date(2015, 12, 5, 1, 2),
        tagList: ['tag-1', 'tag-2'],
        result: ResultEnum.COMPLETED,
        nextAction: ActivityTypeEnum.APPOINTMENT,
    };
    const attributes: TaskUpdateInput = {
        id: 'task-1',
        completedAt: new Date(2015, 12, 5, 1, 2),
        tagList: ['tag-1', 'tag-2'],
        result: ResultEnum.COMPLETED,
        nextAction: ActivityTypeEnum.APPOINTMENT,
    };
    const data: CompleteTaskMutation = {
        updateTask: {
            task,
        },
    };
    return {
        request: {
            query: COMPLETE_TASK_MUTATION,
            variables: {
                accountListId: 'abc',
                attributes,
            },
        },
        result: { data },
    };
};

export default completeTaskMutationMock;
