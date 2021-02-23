import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTypeEnum,
  NotificationTimeUnitEnum,
} from '../../../../types/globalTypes';
import { GetTaskForTaskDrawerQuery } from '../../../../types/GetTaskForTaskDrawerQuery';
import { GET_TASK_FOR_TASK_DRAWER_QUERY } from './Drawer';

export const getTaskForTaskDrawerMock = (): MockedResponse => {
  const data: GetTaskForTaskDrawerQuery = {
    task: {
      id: 'task-1',
      activityType: ActivityTypeEnum.NEWSLETTER_EMAIL,
      subject: 'On the Journey with the Johnson Family',
      startAt: DateTime.local(2012, 1, 5, 1, 2).toISO(),
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

export default getTaskForTaskDrawerMock;
