import { MockedResponse } from '@apollo/client/testing';
import { omit } from 'lodash/fp';
import { GetDataForTaskDrawerQuery } from '../../../../../types/GetDataForTaskDrawerQuery';
import { CreateTaskMutation } from '../../../../../types/CreateTaskMutation';
import {
    ActivityTypeEnum,
    NotificationTypeEnum,
    NotificationTimeUnitEnum,
    TaskInput,
} from '../../../../../types/globalTypes';
import { UpdateTaskMutation } from '../../../../../types/UpdateTaskMutation';
import { GetTaskForTaskDrawerQuery_task as Task } from '../../../../../types/GetTaskForTaskDrawerQuery';
import { GET_DATA_FOR_TASK_DRAWER_QUERY, CREATE_TASK_MUTATION, UPDATE_TASK_MUTATION } from './Form';

export const getDataForTaskDrawerMock = (): MockedResponse => {
    const data: GetDataForTaskDrawerQuery = {
        accountList: {
            taskTagList: ['tag-1', 'tag-2', 'tag-3'],
        },
        contacts: {
            nodes: [
                { id: 'def', name: 'Anderson, Robert' },
                { id: 'ghi', name: 'Smith, John' },
            ],
        },
        accountListUsers: {
            nodes: [
                { id: 'def', user: { id: 'def', firstName: 'Anderson', lastName: 'Robert' } },
                { id: 'ghi', user: { id: 'ghi', firstName: 'Smith', lastName: 'John' } },
            ],
        },
    };
    return {
        request: {
            query: GET_DATA_FOR_TASK_DRAWER_QUERY,
            variables: {
                accountListId: 'abc',
            },
        },
        result: {
            data,
        },
    };
};

export const createTaskMutationMock = (): MockedResponse => {
    const task: Task = {
        id: null,
        activityType: null,
        subject: '',
        startAt: new Date(),
        tagList: [],
        contacts: {
            nodes: [],
        },
        user: null,
        notificationTimeBefore: null,
        notificationType: null,
        notificationTimeUnit: null,
    };
    const data: CreateTaskMutation = {
        createTask: {
            task,
        },
    };
    const attributes: TaskInput = omit(['contacts', 'user'], {
        ...task,
        userId: null,
        contactIds: [],
        startAt: task.startAt.toISOString(),
    });
    return {
        request: {
            query: CREATE_TASK_MUTATION,
            variables: {
                accountListId: 'abc',
                attributes,
            },
        },
        result: { data },
    };
};

export const updateTaskMutationMock = (): MockedResponse => {
    const task: Task = {
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
    };
    const data: UpdateTaskMutation = {
        updateTask: {
            task,
        },
    };
    const attributes: TaskInput = omit(['contacts', 'user'], {
        ...task,
        userId: task.user?.id,
        contactIds: task.contacts.nodes.map(({ id }) => id),
    });
    return {
        request: {
            query: UPDATE_TASK_MUTATION,
            variables: {
                accountListId: 'abc',
                attributes,
            },
        },
        result: { data },
    };
};
