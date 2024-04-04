import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { dispatch } from 'src/lib/analytics';
import TestWrapper from '../../../../../../__tests__/util/TestWrapper';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { GetThisWeekDefaultMocks } from '../../../../Dashboard/ThisWeek/ThisWeek.mock';
import { CompleteTaskDocument } from './CompleteTask.generated';
import TaskModalCompleteForm from './TaskModalCompleteForm';
import {
  addTaskMutationMock,
  completeSimpleTaskMutationMock,
  completeTaskMutationMock,
} from './TaskModalCompleteForm.mock';

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

jest.mock('src/lib/analytics');

jest.mock('uuid', () => ({
  v4: (): string => 'comment-1',
}));

const accountListId = 'abc';
const taskId = 'task-1';

describe('TaskModalCompleteForm', () => {
  const task = {
    id: taskId,
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
  };

  describe('next action', () => {
    it('defaults to the current activity type', () => {
      const { getByRole } = render(
        <TestWrapper>
          <TaskModalCompleteForm
            accountListId={accountListId}
            onClose={jest.fn()}
            task={{ ...task, activityType: ActivityTypeEnum.Email }}
          />
        </TestWrapper>,
      );

      expect(getByRole('combobox', { name: 'Next Action' })).toHaveValue(
        'Email',
      );
    });

    it('is blank for activity types without a matching next action', () => {
      const { getByRole } = render(
        <TestWrapper>
          <TaskModalCompleteForm
            accountListId={accountListId}
            onClose={jest.fn()}
            task={{ ...task, activityType: ActivityTypeEnum.Appointment }}
          />
        </TestWrapper>,
      );

      expect(getByRole('combobox', { name: 'Next Action' })).toHaveValue('');
    });
  });

  it('default', async () => {
    const { getByRole } = render(
      <TestWrapper
        mocks={[
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
      >
        <TaskModalCompleteForm
          accountListId={accountListId}
          onClose={jest.fn()}
          task={task}
        />
      </TestWrapper>,
    );
    expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
      '01/01/2020',
    );
  });

  it('saves simple', async () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <TestWrapper
        mocks={[
          completeSimpleTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
      >
        <TaskModalCompleteForm
          accountListId={accountListId}
          onClose={onClose}
          task={{
            ...task,
            activityType: null,
            completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
          }}
        />
      </TestWrapper>,
    );
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(dispatch).toHaveBeenCalledWith('mpdx-task-completed');
    expect(openTaskModal).not.toHaveBeenCalled();
  });

  it('saves complex', async () => {
    const onClose = jest.fn();
    const completedAt = DateTime.local(2015, 1, 5, 1, 2).toISO();
    const taskAttributes = {
      id: task.id,
      completedAt,
      result: ResultEnum.Completed,
      nextAction: ActivityTypeEnum.Appointment,
      tagList: ['tag-1', 'tag-2'],
    };
    const { getByRole, getByText } = render(
      <TestWrapper
        mocks={[
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
          {
            request: {
              query: CompleteTaskDocument,
              variables: {
                accountListId,
                attributes: taskAttributes,
              },
            },
            result: {
              data: {
                updateTask: {
                  task: taskAttributes,
                },
              },
            },
          },
        ]}
      >
        <TaskModalCompleteForm
          accountListId={accountListId}
          onClose={onClose}
          task={{
            ...task,
            activityType: ActivityTypeEnum.Call,
            completedAt,
            tagList: ['tag-1', 'tag-2'],
          }}
        />
      </TestWrapper>,
    );
    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(getByRole('option', { name: 'Received' }));
    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(getByRole('option', { name: 'Appointment' }));

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'add',
        defaultValues: {
          subject: task.subject,
          activityType: ActivityTypeEnum.Appointment,
          contactIds: ['contact-1', 'contact-2'],
          userId: 'user-1',
          tagList: ['tag-1', 'tag-2'],
        },
      }),
    );
  });

  it('saves comment', async () => {
    const onClose = jest.fn();
    const { getByRole } = render(
      <TestWrapper
        mocks={[
          completeSimpleTaskMutationMock(accountListId, taskId),
          addTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
      >
        <TaskModalCompleteForm
          accountListId={accountListId}
          onClose={onClose}
          task={{
            ...task,
            activityType: null,
            completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
          }}
        />
      </TestWrapper>,
    );
    userEvent.type(
      getByRole('textbox', { name: 'Add New Comment' }),
      'Comment',
    );
    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  describe('completed date', () => {
    it('is the start date for appointments', () => {
      const onClose = jest.fn();
      const { getByRole } = render(
        <TestWrapper>
          <TaskModalCompleteForm
            accountListId={accountListId}
            onClose={onClose}
            task={{
              ...task,
              activityType: ActivityTypeEnum.Appointment,
              startAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
            }}
          />
        </TestWrapper>,
      );

      expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
        '01/05/2015',
      );
      expect(getByRole('textbox', { name: /^Choose time/ })).toHaveValue(
        '01:02 AM',
      );
    });

    it('is now for other tasks', () => {
      const onClose = jest.fn();
      const { getByRole } = render(
        <TestWrapper>
          <TaskModalCompleteForm
            accountListId={accountListId}
            onClose={onClose}
            task={{
              ...task,
              activityType: ActivityTypeEnum.Call,
              startAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
            }}
          />
        </TestWrapper>,
      );

      expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
        '01/01/2020',
      );
      expect(getByRole('textbox', { name: /^Choose time/ })).toHaveValue(
        '12:00 AM',
      );
    });
  });

  const getOptions = (
    activityType?: ActivityTypeEnum,
  ): { results: ResultEnum[]; nextActions: ActivityTypeEnum[] } => {
    const { getByRole, queryByRole } = render(
      <TestWrapper>
        <TaskModalCompleteForm
          accountListId={accountListId}
          onClose={jest.fn()}
          task={{
            ...task,
            activityType,
          }}
        />
      </TestWrapper>,
    );
    let results: ResultEnum[] = [];
    const resultButton = queryByRole('combobox', { name: 'Result' });
    if (resultButton) {
      userEvent.click(resultButton);
      results = within(getByRole('listbox', { name: 'Result' }))
        .getAllByRole('option')
        .map((option) => option.textContent)
        .filter(Boolean) as ResultEnum[];
      userEvent.click(getByRole('option', { name: 'Completed' }));
    }
    let nextActions: ActivityTypeEnum[] = [];
    const nextActionCombobox = queryByRole('combobox', { name: 'Next Action' });
    if (nextActionCombobox) {
      userEvent.click(nextActionCombobox);
      nextActions = within(getByRole('listbox'))
        .getAllByRole('option')
        .map((option) => option[Object.keys(option)[0]]?.key)
        .filter(Boolean) as ActivityTypeEnum[];
    }
    return { results, nextActions };
  };

  it('has correct options for APPOINTMENT', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Appointment);
    expect(results).toEqual(['Completed', 'Attempted']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for CALL', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Call);
    expect(results).toEqual([
      'Completed',
      'Attempted',
      'Attempted - Left Message',
      'Received',
    ]);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Appointment',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for EMAIL', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Email);
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Appointment',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for FACEBOOK_MESSAGE', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.FacebookMessage,
    );
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Appointment',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for LETTER', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Letter);
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
    ]);
  });

  it('has correct options for NEWSLETTER_EMAIL', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.NewsletterEmail,
    );
    expect(results).toEqual([]);
    expect(nextActions).toEqual([]);
  });

  it('has correct options for NEWSLETTER_PHYSICAL', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.NewsletterPhysical,
    );
    expect(results).toEqual([]);
    expect(nextActions).toEqual([]);
  });

  it('has correct options for NONE', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.None);
    expect(results).toEqual([]);
    expect(nextActions).toEqual([]);
  });

  it('has correct options for PRAYER_REQUEST', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.PrayerRequest);
    expect(results).toEqual(['Completed']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Appointment',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for PRE_CALL_LETTER', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.PreCallLetter);
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
    ]);
  });

  it('has correct options for REMINDER_LETTER', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.ReminderLetter,
    );
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
    ]);
  });

  it('has correct options for SUPPORT_LETTER', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.SupportLetter);
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
    ]);
  });

  it('has correct options for TALK_TO_IN_PERSON', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.TalkToInPerson,
    );
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Appointment',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for TEXT_MESSAGE', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.TextMessage);
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
      'Appointment',
      'Prayer Request',
      'Thank',
    ]);
  });

  it('has correct options for THANK', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Thank);
    expect(results).toEqual(['Completed', 'Received']);
    expect(nextActions).toEqual([
      'None',
      'Call',
      'Email',
      'Text Message',
      'Facebook Message',
      'Talk To In Person',
    ]);
  });

  it('has correct options for TO_DO', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.ToDo);
    expect(results).toEqual([]);
    expect(nextActions).toEqual([]);
  });

  it('has correct options for null', () => {
    const { results, nextActions } = getOptions(undefined);
    expect(results).toEqual([]);
    expect(nextActions).toEqual([]);
  });
});
