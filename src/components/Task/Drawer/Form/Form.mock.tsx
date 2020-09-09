import { MockedResponse } from '@apollo/client/testing';
import { omit } from 'lodash/fp';
import { addHours, startOfHour } from 'date-fns';
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
            id: 'abc',
            taskTagList: ['tag-1', 'tag-2', 'tag-3'],
        },
        contacts: {
            nodes: [
                { id: 'contact-1', name: 'Anderson, Robert' },
                { id: 'contact-2', name: 'Smith, John' },
            ],
        },
        accountListUsers: {
            nodes: [
                { id: 'def', user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' } },
                { id: 'ghi', user: { id: 'user-2', firstName: 'John', lastName: 'Smith' } },
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
        subject: 'abc',
        startAt: startOfHour(addHours(new Date(), 1)),
        completedAt: null,
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
            task: { ...task, id: 'task-1' },
        },
    };
    const attributes: TaskInput = omit(['contacts', 'user'], {
        ...task,
        userId: null,
        contactIds: [],
    });
    return {
        request: {
            query: CREATE_TASK_MUTATION,
            variables: {
                accountListId: 'abc',
                attributes: omit('id', attributes),
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
    };
    const data: UpdateTaskMutation = {
        updateTask: {
            task,
        },
    };
    const attributes: TaskInput = omit(['contacts', 'user'], {
        ...task,
        userId: task.user.id,
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
