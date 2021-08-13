import React from 'react';
import { render, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { getDataForTaskDrawerMock } from '../Form/Form.mock';
import TestWrapper from '../../../../../__tests__/util/TestWrapper';
import { dateFormat } from '../../../../lib/intlFormat/intlFormat';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
} from '../../../../../graphql/types.generated';
import { GetThisWeekDefaultMocks } from '../../../Dashboard/ThisWeek/ThisWeek.mock';
import useTaskDrawer from '../../../../hooks/useTaskDrawer';
import {
  completeTaskMutationMock,
  completeSimpleTaskMutationMock,
} from './CompleteForm.mock';
import TaskDrawerCompleteForm from '.';

jest.mock('../../../../hooks/useTaskDrawer');

const openTaskDrawer = jest.fn();

beforeEach(() => {
  (useTaskDrawer as jest.Mock).mockReturnValue({
    openTaskDrawer,
  });
});

const accountListId = 'abc';
const taskId = 'task-1';

describe('TaskDrawerCompleteForm', () => {
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

  it('default', async () => {
    const { getAllByRole } = render(
      <TestWrapper
        mocks={[
          getDataForTaskDrawerMock(accountListId),
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
        disableAppProvider
      >
        <TaskDrawerCompleteForm
          accountListId={accountListId}
          onClose={jest.fn()}
          task={task}
        />
      </TestWrapper>,
    );
    const dateString = dateFormat(DateTime.local());
    expect(
      getAllByRole('textbox').find(
        (item) => (item as HTMLInputElement).value === dateString,
      ),
    ).toBeInTheDocument();
  });

  it('saves simple', async () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <TestWrapper
        mocks={[
          getDataForTaskDrawerMock(accountListId),
          completeSimpleTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
        disableAppProvider
      >
        <TaskDrawerCompleteForm
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
    expect(openTaskDrawer).not.toHaveBeenCalled();
  });

  it('saves complex', async () => {
    const onClose = jest.fn();
    const { getByRole, getByText } = render(
      <TestWrapper
        mocks={[
          getDataForTaskDrawerMock(accountListId),
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
        disableAppProvider
      >
        <TaskDrawerCompleteForm
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
    userEvent.click(getByRole('button', { name: 'Result' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Result' })).getByText('COMPLETED'),
    );
    userEvent.click(getByRole('button', { name: 'Next Action' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Next Action' })).getByText(
        'APPOINTMENT',
      ),
    );
    const tagsElement = getByRole('textbox', { name: 'Tags' });
    userEvent.click(tagsElement);
    userEvent.click(
      await within(getByRole('presentation')).findByText('tag-1'),
    );
    userEvent.click(tagsElement);
    userEvent.click(within(getByRole('presentation')).getByText('tag-2'));
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(openTaskDrawer).toHaveBeenCalledWith({
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
      <TestWrapper
        mocks={[getDataForTaskDrawerMock(accountListId)]}
        disableAppProvider
      >
        <TaskDrawerCompleteForm
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
    if (queryByRole('button', { name: 'Result' })) {
      userEvent.click(getByRole('button', { name: 'Result' }));
      results = within(getByRole('listbox', { name: 'Result' }))
        .getAllByRole('option')
        .map((option) => option.textContent)
        .filter(Boolean) as ResultEnum[];
      userEvent.click(getByRole('option', { name: 'NONE' }));
    }
    let nextActions: ActivityTypeEnum[] = [];
    if (queryByRole('button', { name: 'Next Action' })) {
      userEvent.click(getByRole('button', { name: 'Next Action' }));
      nextActions = within(getByRole('listbox', { name: 'Next Action' }))
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
