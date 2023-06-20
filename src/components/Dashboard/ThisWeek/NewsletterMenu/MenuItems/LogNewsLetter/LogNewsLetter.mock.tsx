import { MockedResponse } from '@apollo/client/testing';
import { DateTime } from 'luxon';
import { TaskRowFragment } from 'src/components/Task/TaskRow/TaskRow.generated';
import {
  ActivityTypeEnum,
  TaskCreateInput,
} from '../../../../../../../graphql/types.generated';
import {
  CreateTasksDocument,
  CreateTasksMutation,
} from '../../../../../Task/Modal/Form/TaskModal.generated';

export const createNewsletterTaskMutationMock = (
  id: string,
  activityType: ActivityTypeEnum,
): MockedResponse => {
  const task: TaskCreateInput = {
    activityType,
    completedAt: null,
    startAt: DateTime.local().toISO(),
    subject: 'abc',
    comment: 'comment',
  };
  const data: CreateTasksMutation = {
    createTasks: {
      tasks: [{ ...task, id } as TaskRowFragment],
    },
  };

  return {
    request: {
      query: CreateTasksDocument,
      variables: {
        accountListId: 'abc',
        attributes: task,
      },
    },
    result: { data },
  };
};
