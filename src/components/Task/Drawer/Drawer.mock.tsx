import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
} from '../../../../graphql/types.generated';
import {
  GetTaskForTaskDrawerDocument,
  GetTaskForTaskDrawerQuery,
} from './TaskDrawerTask.generated';

export const getTaskForTaskDrawerMock = (): MockedResponse => {
  const data: GetTaskForTaskDrawerQuery = {
    task: {
      id: 'task-1',
      activityType: ActivityTypeEnum.NewsletterEmail,
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
      notificationType: NotificationTypeEnum.Both,
      notificationTimeUnit: NotificationTimeUnitEnum.Hours,
    },
  };
  return {
    request: {
      query: GetTaskForTaskDrawerDocument,
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
