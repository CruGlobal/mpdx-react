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
  DisplayResultEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { dispatch } from 'src/lib/analytics';
import theme from 'src/theme';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { GetThisWeekDefaultMocks } from '../../../../Dashboard/ThisWeek/ThisWeek.mock';
import { TaskModalEnum } from '../../TaskModal';
import {
  ContactStatusQueryMock,
  updateContactStatusMutationMock,
} from '../TaskModalMocks';
import { taskModalTests } from '../TaskModalTests';
import { CompleteTaskDocument } from './CompleteTask.generated';
import TaskModalCompleteForm from './TaskModalCompleteForm';
import {
  completeSimpleTaskMutationMock,
  completeTaskMutationMock,
  createTaskCommentMutation,
} from './TaskModalCompleteForm.mock';

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

    it("doesn't not render suggested contact status when multiple contact", async () => {
      const { getByRole, queryByText } = render(
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
          queryByText(
            "Change the contact's status to: CONTACT_FOR_APPOINTMENT",
          ),
        ).not.toBeInTheDocument();
      });
    });

    it('renders suggested status when single contact', async () => {
      const { getByRole, getByText } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.AppointmentInPerson,
            contacts: {
              nodes: [{ id: 'contact-1', name: 'Anderson, Robert' }],
            },
          }}
          mocks={[
            ContactStatusQueryMock(
              accountListId,
              'contact-1',
              StatusEnum.NeverContacted,
            ),
          ]}
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
          getByText("Change the contact's status to:"),
        ).toBeInTheDocument();
        expect(getByText('Initiate for Appointment')).toBeInTheDocument();
      });
    });

    it('should not render <Result> if no result to select', async () => {
      const { queryByRole } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.PartnerCareEmail,
          }}
        />,
      );

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

      const resultDropdown = getByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(getByRole('option', { name: 'Partner-Financial' }));
      });

      const nextActionDropdown = getByRole('combobox', { name: 'Next Action' });
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
          queryByRole('option', { name: 'Phone Call' }),
        ).not.toBeInTheDocument();
      });

      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(getByRole('option', { name: 'Follow up' }));
      });

      userEvent.click(nextActionDropdown);

      await waitFor(() => {
        expect(
          queryByRole('option', { name: 'Thank You Note' }),
        ).not.toBeInTheDocument();

        expect(
          getAllByRole('option', { name: 'Social Media' })[0],
        ).toBeInTheDocument();

        expect(getByRole('option', { name: 'Phone Call' })).toBeInTheDocument();
      });
    });

    it('renders all options if suggested next actions is null', async () => {
      const { getByRole, getAllByRole } = render(
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

      const nextActionDropdown = getByRole('combobox', { name: 'Next Action' });
      userEvent.click(nextActionDropdown);

      await waitFor(() => {
        expect(
          getAllByRole('option', { name: 'Social Media' })[0],
        ).toBeInTheDocument();

        expect(getByRole('option', { name: 'Email' })).toBeInTheDocument();
      });
    });

    it('does not render the Next Actions when Result "not Interested" is selected', async () => {
      const { getByRole, queryByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );
      userEvent.click(getByRole('combobox', { name: 'Result' }));
      await waitFor(() => {
        userEvent.click(getByRole('option', { name: 'Not Interested' }));
      });

      expect(
        queryByRole('combobox', { name: 'Next Action' }),
      ).not.toBeInTheDocument();
    });

    it('next action does not show until result is selected', async () => {
      const { getByRole, findByRole, queryByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      expect(
        queryByRole('combobox', { name: 'Next Action' }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('combobox', { name: 'Result' }));
      userEvent.click(await findByRole('option', { name: 'Follow up' }));

      expect(
        getByRole('combobox', { name: 'Next Action' }),
      ).toBeInTheDocument();

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
      displayResult: DisplayResultEnum.FollowUpResultPartnerSpecial,
      result: ResultEnum.Completed,
      nextAction: ActivityTypeEnum.PartnerCareThank,
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
        view: TaskModalEnum.Add,
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
      displayResult: DisplayResultEnum.FollowUpResultPartnerSpecial,
      result: ResultEnum.Completed,
      nextAction: ActivityTypeEnum.PartnerCareThank,
      tagList: ['tag-1', 'tag-2'],
    };
    const { getByRole, findByRole, getByText, findByText } = render(
      <Components
        mocks={[
          ContactStatusQueryMock(
            accountListId,
            'contact-1',
            StatusEnum.ContactForAppointment,
          ),
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
          updateContactStatusMutationMock(
            accountListId,
            'contact-1',
            StatusEnum.PartnerSpecial,
          ),
        ]}
        taskOverrides={{
          activityType: ActivityTypeEnum.AppointmentInPerson,
          completedAt,
          tagList: ['tag-1', 'tag-2'],
          contacts: {
            nodes: [{ id: 'contact-1', name: 'Anderson, Robert' }],
          },
        }}
      />,
    );
    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'Partner-Special' }));
    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(await findByRole('option', { name: 'Thank You Note' }));

    userEvent.click(await findByText("Change the contact's status to:"));
    expect(getByText('Partner - Special')).toBeInTheDocument();

    userEvent.click(getByText('Save'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'add',
        defaultValues: {
          activityType: ActivityTypeEnum.PartnerCareThank,
          contactIds: ['contact-1'],
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
