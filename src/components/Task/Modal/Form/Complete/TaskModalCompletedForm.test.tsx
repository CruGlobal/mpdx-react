import React from 'react';
import { render, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { getDataForTaskModalMock } from '../TaskModalForm.mock';
import TestWrapper from '../../../../../../__tests__/util/TestWrapper';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
} from '../../../../../../graphql/types.generated';
import { GetThisWeekDefaultMocks } from '../../../../Dashboard/ThisWeek/ThisWeek.mock';
import useTaskModal from '../../../../../hooks/useTaskModal';
import {
  completeTaskMutationMock,
  completeSimpleTaskMutationMock,
} from './TaskModalCompleteForm.mock';
import TaskModalCompleteForm from './TaskModalCompleteForm';

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

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

  it.skip('default', async () => {
    const { getAllByRole } = render(
      <TestWrapper
        mocks={[
          getDataForTaskModalMock(accountListId),
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
    expect(
      getAllByRole('textbox').find((item) => item.id === ':r0:'),
    ).toHaveValue('Jan 01, 2020');
  });

  it('saves simple', async () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <TestWrapper
        mocks={[
          getDataForTaskModalMock(accountListId),
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
    expect(openTaskModal).not.toHaveBeenCalled();
  });

  it.skip('saves complex', async () => {
    const onClose = jest.fn();
    const { getByRole, getByText } = render(
      <TestWrapper
        mocks={[
          getDataForTaskModalMock(accountListId),
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
      >
        <TaskModalCompleteForm
          accountListId={accountListId}
          onClose={onClose}
          task={{
            ...task,
            activityType: ActivityTypeEnum.Call,
            completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
            tagList: [],
          }}
        />
      </TestWrapper>,
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Result' }));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Result' })).getByText(
        'COMPLETED',
      ),
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Next Action' }));
    userEvent.click(
      within(
        getByRole('listbox', { hidden: true, name: 'Next Action' }),
      ).getByText('APPOINTMENT'),
    );

    userEvent.click(getByText('Save'));
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: {
        activityType: ActivityTypeEnum.Appointment,
        contacts: {
          nodes: [
            { id: 'contact-1', name: 'Anderson, Robert' },
            { id: 'contact-2', name: 'Smith, John' },
          ],
        },
        user: { id: 'user-1', firstName: 'Anderson', lastName: 'Robert' },
      },
    });
  });

  const getOptions = (
    activityType?: ActivityTypeEnum,
  ): { results: ResultEnum[]; nextActions: ActivityTypeEnum[] } => {
    const { getByRole, queryByRole } = render(
      <TestWrapper mocks={[getDataForTaskModalMock(accountListId)]}>
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
    if (queryByRole('button', { hidden: true, name: 'Result' })) {
      userEvent.click(getByRole('button', { hidden: true, name: 'Result' }));
      results = within(getByRole('listbox', { hidden: true, name: 'Result' }))
        .getAllByRole('option')
        .map((option) => option.textContent)
        .filter(Boolean) as ResultEnum[];
      userEvent.click(getByRole('option', { hidden: true, name: 'NONE' }));
    }
    let nextActions: ActivityTypeEnum[] = [];
    if (queryByRole('button', { hidden: true, name: 'Next Action' })) {
      userEvent.click(
        getByRole('button', { hidden: true, name: 'Next Action' }),
      );
      nextActions = within(
        getByRole('listbox', { hidden: true, name: 'Next Action' }),
      )
        .getAllByRole('option')
        .map((option) => option.textContent)
        .filter(Boolean) as ActivityTypeEnum[];
    }
    return { results, nextActions };
  };

  it('has correct options for APPOINTMENT', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Appointment);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Attempted,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for CALL', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Call);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Attempted,
      ResultEnum.AttemptedLeftMessage,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.Appointment,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for EMAIL', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Email);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.Appointment,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for FACEBOOK_MESSAGE', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.FacebookMessage,
    );
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.Appointment,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for LETTER', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Letter);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
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
    expect(results).toEqual([ResultEnum.None, ResultEnum.Completed]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.Appointment,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for PRE_CALL_LETTER', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.PreCallLetter);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
    ]);
  });

  it('has correct options for REMINDER_LETTER', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.ReminderLetter,
    );
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
    ]);
  });

  it('has correct options for SUPPORT_LETTER', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.SupportLetter);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
    ]);
  });

  it('has correct options for TALK_TO_IN_PERSON', () => {
    const { results, nextActions } = getOptions(
      ActivityTypeEnum.TalkToInPerson,
    );
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.Appointment,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for TEXT_MESSAGE', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.TextMessage);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
      ActivityTypeEnum.Appointment,
      ActivityTypeEnum.PrayerRequest,
      ActivityTypeEnum.Thank,
    ]);
  });

  it('has correct options for THANK', () => {
    const { results, nextActions } = getOptions(ActivityTypeEnum.Thank);
    expect(results).toEqual([
      ResultEnum.None,
      ResultEnum.Completed,
      ResultEnum.Received,
    ]);
    expect(nextActions).toEqual([
      ActivityTypeEnum.None,
      ActivityTypeEnum.Call,
      ActivityTypeEnum.Email,
      ActivityTypeEnum.TextMessage,
      ActivityTypeEnum.FacebookMessage,
      ActivityTypeEnum.TalkToInPerson,
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
