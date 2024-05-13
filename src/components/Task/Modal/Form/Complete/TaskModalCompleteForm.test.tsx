import React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import TestWrapper from '__tests__/util/TestWrapper';
import LoadConstantsMock from 'src/components/Constants/LoadConstantsMock';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { dispatch } from 'src/lib/analytics';
import theme from 'src/theme';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { GetThisWeekDefaultMocks } from '../../../../Dashboard/ThisWeek/ThisWeek.mock';
import { updateContactStatusMutationMock } from '../TaskModalMocks';
import { CompleteTaskDocument } from './CompleteTask.generated';
import TaskModalCompleteForm from './TaskModalCompleteForm';
import {
  completeSimpleTaskMutationMock,
  completeTaskMutationMock,
  createTaskCommentMutation,
} from './TaskModalCompleteForm.mock';
import { taskModalTests } from './TaskModalTests.test';

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();
const onClose = jest.fn();
const onErrorFunction = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
  onClose.mockClear();
  onErrorFunction.mockClear();
});

jest.mock('src/lib/analytics');

jest.mock('uuid', () => ({
  v4: (): string => 'comment-1',
}));

const accountListId = 'abc';
const taskId = 'task-1';
const task = {
  id: taskId,
  activityType: ActivityTypeEnum.AppointmentInPerson,
  subject: 'On the Journey with the Johnson Family',
  startAt: DateTime.local(2020, 1, 1, 1, 2).toISO(),
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

type ComponentsProps = {
  mocks?: MockedResponse[];
  taskOverrides?: object;
  props?: object;
};
const Components = ({ mocks = [], taskOverrides, props }: ComponentsProps) => (
  <ThemeProvider theme={theme}>
    <TestWrapper
      mocks={[LoadConstantsMock(), ...mocks]}
      onErrorFunction={onErrorFunction}
    >
      <TaskModalCompleteForm
        accountListId={accountListId}
        onClose={onClose}
        task={{
          ...task,
          ...taskOverrides,
        }}
        {...props}
      />
    </TestWrapper>
  </ThemeProvider>
);

describe('TaskModalCompleteForm', () => {
  describe('Result', () => {
    it('defaults to only showing results from phase', async () => {
      const { getByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const resultDropdown = getByRole('combobox', { name: 'Result' });

      userEvent.click(resultDropdown);

      await waitFor(() => {
        expect(
          getByRole('option', { name: 'Cancelled-Need to reschedule' }),
        ).toBeInTheDocument();
        expect(
          getByRole('option', { name: 'Not Interested' }),
        ).toBeInTheDocument();
        expect(
          getByRole('option', { name: 'Partner-Financial' }),
        ).toBeInTheDocument();
      });
    });

    it('renders multiple contact message warning', async () => {
      const { getByRole, getByText } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const resultDropdown = getByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(
          getByRole('option', { name: 'Cancelled-Need to reschedule' }),
        );
      });

      await waitFor(() => {
        expect(
          getByText('This will change the contact status for 2 contacts'),
        ).toBeInTheDocument();

        expect(
          getByText("Change the contact's status to: CONTACT_FOR_APPOINTMENT"),
        ).toBeInTheDocument();
      });
    });

    it('does not renders multiple contact message warning', async () => {
      const { getByRole, getByText, queryByText } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.AppointmentInPerson,
            contacts: {
              nodes: [{ id: 'contact-1', name: 'Anderson, Robert' }],
            },
          }}
        />,
      );

      const resultDropdown = getByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(
          getByRole('option', { name: 'Cancelled-Need to reschedule' }),
        );
      });

      await waitFor(() => {
        expect(
          queryByText('This will change the contact status for 2 contacts'),
        ).not.toBeInTheDocument();

        expect(
          getByText("Change the contact's status to: CONTACT_FOR_APPOINTMENT"),
        ).toBeInTheDocument();
      });
    });

    it('should not render <Result> if no result to select', async () => {
      const { findByRole, queryByRole } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.PartnerCareEmail,
          }}
        />,
      );

      const nextActionDropdown = await findByRole('combobox', {
        name: 'Next Action',
      });
      expect(nextActionDropdown).toBeInTheDocument();

      await waitFor(() => {
        expect(
          queryByRole('combobox', { name: 'Result' }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('next action', () => {
    it('narrows down next actions on result', async () => {
      const { getByRole, getAllByRole, queryByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const nextActionDropdown = getByRole('combobox', { name: 'Next Action' });
      userEvent.click(nextActionDropdown);

      await waitFor(() => {
        expect(
          getAllByRole('option', { name: 'Social Media' })[0],
        ).toBeInTheDocument();

        expect(
          getByRole('option', { name: 'Digital Newsletter' }),
        ).toBeInTheDocument();
      });

      const resultDropdown = getByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(getByRole('option', { name: 'Partner-Financial' }));
      });

      userEvent.click(nextActionDropdown);

      await waitFor(() => {
        expect(getByRole('option', { name: 'None' })).toBeInTheDocument();
        expect(
          getByRole('option', { name: 'Thank You Note' }),
        ).toBeInTheDocument();

        expect(
          queryByRole('option', { name: 'In Person' }),
        ).not.toBeInTheDocument();
        expect(
          queryByRole('option', { name: 'Digital Newsletter' }),
        ).not.toBeInTheDocument();
      });
    });

    it('renders all options if suggested next actions is null', async () => {
      const { getByRole, getAllByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const nextActionDropdown = getByRole('combobox', { name: 'Next Action' });
      const resultDropdown = getByRole('combobox', { name: 'Result' });

      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(getByRole('option', { name: 'Not Interested' }));
      });

      userEvent.click(nextActionDropdown);

      await waitFor(() => {
        expect(
          getAllByRole('option', { name: 'Social Media' })[0],
        ).toBeInTheDocument();

        expect(
          getByRole('option', { name: 'Digital Newsletter' }),
        ).toBeInTheDocument();
      });
    });

    it('is blank for activity types without a matching next action', () => {
      const { getByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      expect(getByRole('combobox', { name: 'Next Action' })).toHaveValue('');
    });
  });

  it('saves the default values correctly', async () => {
    const { getByRole } = render(
      <Components
        mocks={[
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
      />,
    );
    expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
      '01/01/2020',
    );
  });

  it('saves simple', async () => {
    const { getByText } = render(
      <Components
        mocks={[
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
        taskOverrides={{
          activityType: null,
          completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
        }}
      />,
    );
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(dispatch).toHaveBeenCalledWith('mpdx-task-completed');
    expect(openTaskModal).not.toHaveBeenCalled();
  });

  it('saves complex', async () => {
    const completedAt = DateTime.local(2015, 1, 5, 1, 2).toISO();
    const taskAttributes = {
      id: task.id,
      completedAt,
      result: ResultEnum.Completed,
      nextAction: ActivityTypeEnum.AppointmentInPerson,
      tagList: ['tag-1', 'tag-2'],
    };
    const { getByRole, findByRole, getByText } = render(
      <Components
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
        taskOverrides={{
          activityType: ActivityTypeEnum.FollowUpPhoneCall,
          completedAt,
          tagList: ['tag-1', 'tag-2'],
        }}
      />,
    );
    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'Partner-Special' }));
    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(await findByRole('option', { name: 'Thank You Note' }));

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'add',
        defaultValues: {
          activityType: ActivityTypeEnum.PartnerCareThank,
          contactIds: ['contact-1', 'contact-2'],
          userId: 'user-1',
          tagList: ['tag-1', 'tag-2'],
        },
      }),
    );
  });

  it('saves contacts new status', async () => {
    const completedAt = DateTime.local(2015, 1, 5, 1, 2).toISO();
    const taskAttributes = {
      id: task.id,
      completedAt,
      result: ResultEnum.Completed,
      nextAction: ActivityTypeEnum.AppointmentInPerson,
      tagList: ['tag-1', 'tag-2'],
    };
    const { getByRole, findByRole, getByText } = render(
      <Components
        mocks={[
          completeTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
          {
            request: {
              query: CompleteTaskDocument,
              variables: {
                accountListId,
                attributes: {
                  ...taskAttributes,
                  result: ResultEnum.Completed,
                  nextAction: ActivityTypeEnum.PartnerCareThank,
                },
              },
            },
            result: {
              data: {
                updateTask: {
                  task: {
                    ...taskAttributes,
                    result: ResultEnum.Completed,
                    nextAction: ActivityTypeEnum.PartnerCareThank,
                  },
                },
              },
            },
          },
          updateContactStatusMutationMock(
            accountListId,
            'contact-1',
            StatusEnum.PartnerSpecial,
          ),
          updateContactStatusMutationMock(
            accountListId,
            'contact-2',
            StatusEnum.PartnerSpecial,
          ),
        ]}
        taskOverrides={{
          activityType: ActivityTypeEnum.FollowUpPhoneCall,
          completedAt,
          tagList: ['tag-1', 'tag-2'],
        }}
      />,
    );
    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'Partner-Special' }));
    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(await findByRole('option', { name: 'Thank You Note' }));

    userEvent.click(
      getByText("Change the contact's status to: PARTNER_SPECIAL"),
    );

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'add',
        defaultValues: {
          activityType: ActivityTypeEnum.PartnerCareThank,
          contactIds: ['contact-1', 'contact-2'],
          userId: 'user-1',
          tagList: ['tag-1', 'tag-2'],
        },
      }),
    );
    onErrorFunction.mock.calls.forEach((call) => {
      expect(
        JSON.stringify(call[0]).includes('UpdateContactStatus'),
      ).toBeFalsy();
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('saves result as Completed when no activityType', async () => {
    const { getByRole } = render(
      <Components
        mocks={[
          completeSimpleTaskMutationMock(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
        taskOverrides={{
          activityType: null,
          completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
        }}
      />,
    );
    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    onErrorFunction.mock.calls.forEach((call) => {
      expect(JSON.stringify(call[0]).includes('CompleteTask')).toBeFalsy();
    });
  });

  it('saves comment', async () => {
    const { getByRole } = render(
      <Components
        mocks={[
          completeSimpleTaskMutationMock(accountListId, taskId),
          createTaskCommentMutation(accountListId, taskId),
          GetThisWeekDefaultMocks()[0],
        ]}
        taskOverrides={{
          activityType: null,
          completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
        }}
      />,
    );
    userEvent.type(
      getByRole('textbox', { name: 'Add New Comment' }),
      'Comment',
    );
    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    onErrorFunction.mock.calls.forEach((call) => {
      expect(JSON.stringify(call[0]).includes('CreateTaskComment')).toBeFalsy();
    });
  });

  describe('completed date', () => {
    it('is the start date for appointments', () => {
      const { getByRole } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.AppointmentVideoCall,
            startAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
          }}
        />,
      );

      expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
        '01/05/2015',
      );
      expect(getByRole('textbox', { name: /^Choose time/ })).toHaveValue(
        '01:02 AM',
      );
    });

    it('defaults date to now for other tasks', () => {
      const { getByRole } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.InitiationPhoneCall,
            startAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
          }}
        />,
      );

      expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
        '01/01/2020',
      );
      expect(getByRole('textbox', { name: /^Choose time/ })).toHaveValue(
        '12:00 AM',
      );
    });
  });

  taskModalTests(Components);
});
