import { DateTime } from 'luxon';
import { MockedResponse } from '@apollo/client/testing';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import { TaskFilter } from './List';
import {
  GetTasksForTaskListDocument,
  GetTasksForTaskListQuery,
} from './TaskList.generated';

export const getTasksForTaskListMock = (): MockedResponse => {
  const data: GetTasksForTaskListQuery = {
    tasks: {
      nodes: [
        {
          id: 'task-1',
          activityType: ActivityTypeEnum.Appointment,
          subject: 'On the Journey with the Johnson Family',
          startAt: DateTime.local(2012, 1, 5, 1, 2),
          completedAt: null,
          tagList: ['tag-1', 'tag-2'],
          contacts: {
            nodes: [
              { id: 'contact-1', name: 'Anderson, Robert' },
              { id: 'contact-2', name: 'Smith, John' },
            ],
          },
          user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' },
        },
      ],
      totalCount: 1,
      pageInfo: {
        startCursor: 'A',
        endCursor: 'B',
      },
    },
  };

  return {
    request: {
      query: GetTasksForTaskListDocument,
      variables: {
        accountListId: 'abc',
        first: 100,
        after: null,
        before: null,
        userIds: [],
        tags: [],
        contactIds: [],
        activityType: [],
        completed: null,
        startAt: null,
      },
    },
    result: {
      data,
    },
  };
};

export const getEmptyTasksForTaskListMock = (): MockedResponse => {
  const data: GetTasksForTaskListQuery = {
    tasks: {
      nodes: [],
      totalCount: 0,
      pageInfo: {
        startCursor: 'A',
        endCursor: 'B',
      },
    },
  };

  return {
    request: {
      query: GetTasksForTaskListDocument,
      variables: {
        accountListId: 'abc',
        first: 100,
        after: null,
        before: null,
        userIds: [],
        tags: [],
        contactIds: [],
        activityType: [],
        completed: null,
        startAt: null,
      },
    },
    result: {
      data,
    },
  };
};

interface Attributes extends TaskFilter {
  first?: number;
}

export const getFilteredTasksForTaskListMock = (
  filter: Partial<Attributes>,
): MockedResponse => {
  const data: GetTasksForTaskListQuery = {
    tasks: {
      nodes: [
        {
          id: 'task-1',
          activityType: ActivityTypeEnum.Appointment,
          subject: 'On the Journey with the Johnson Family',
          startAt: DateTime.local(2012, 1, 5, 1, 2),
          completedAt: null,
          tagList: ['tag-1', 'tag-2'],
          contacts: {
            nodes: [
              { id: 'contact-1', name: 'Anderson, Robert' },
              { id: 'contact-2', name: 'Smith, John' },
            ],
          },
          user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' },
        },
        {
          id: 'task-1',
          activityType: ActivityTypeEnum.Appointment,
          subject: 'On the Journey with the Johnson Family 2020',
          startAt: DateTime.fromISO('2020-09-01'),
          completedAt: null,
          tagList: ['tag-1', 'tag-2'],
          contacts: {
            nodes: [
              { id: 'contact-1', name: 'Anderson, Robert' },
              { id: 'contact-2', name: 'Smith, John' },
            ],
          },
          user: { id: 'user-1', firstName: 'Robert', lastName: 'Anderson' },
        },
      ],
      totalCount: 1000,
      pageInfo: {
        startCursor: 'A',
        endCursor: 'B',
      },
    },
  };

  return {
    request: {
      query: GetTasksForTaskListDocument,
      variables: {
        accountListId: 'abc',
        first: 100,
        after: null,
        before: null,
        userIds: [],
        tags: [],
        contactIds: [],
        activityType: [],
        completed: null,
        startAt: null,
        ...filter,
      },
    },
    result: {
      data,
    },
  };
};
