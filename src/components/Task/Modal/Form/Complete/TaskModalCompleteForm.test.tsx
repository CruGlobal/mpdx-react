import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { LoadConstantsQuery } from 'src/components/Constants/LoadConstants.generated';
import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import {
  ActivityTypeEnum,
  NotificationTimeUnitEnum,
  NotificationTypeEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { dispatch } from 'src/lib/analytics';
import theme from 'src/theme';
import useTaskModal from '../../../../../hooks/useTaskModal';
import { TaskModalEnum } from '../../TaskModal';
import { ContactStatusQuery } from '../Inputs/SuggestedContactStatus/SuggestedContactStatus.generated';
import { taskModalTests } from '../TaskModalTests';
import TaskModalCompleteForm from './TaskModalCompleteForm';

jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();
const onClose = jest.fn();
const onErrorMock = jest.fn();
const mutationSpy = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
  onClose.mockClear();
  onErrorMock.mockClear();
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
  mocks?: ApolloErgonoMockMap;
  taskOverrides?: object;
  props?: object;
};
const Components = ({ mocks = {}, taskOverrides, props }: ComponentsProps) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <SnackbarProvider>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          LoadConstant: LoadConstantsQuery;
          ContactStatus: ContactStatusQuery;
        }>
          mocks={{
            LoadConstants: loadConstantsMockData,
            ContactStatus: {
              contact: {
                status: null,
              },
            },
            ...mocks,
          }}
          onCall={mutationSpy}
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
        </GqlMockedProvider>
      </ThemeProvider>
    </SnackbarProvider>
  </LocalizationProvider>
);

describe('TaskModalCompleteForm', () => {
  describe('Result', () => {
    it('defaults to only showing results from phase', async () => {
      const { getByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const resultDropdown = await waitFor(() =>
        getByRole('combobox', { name: 'Result' }),
      );

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

    it("doesn't render suggested contact status when multiple contacts", async () => {
      const { queryByRole, findByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const resultDropdown = await findByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);

      userEvent.click(
        await findByRole('option', { name: 'Cancelled-Need to reschedule' }),
      );

      await waitFor(() => {
        expect(
          queryByRole('checkbox', { name: /^Change the contact's status/ }),
        ).not.toBeInTheDocument();
      });
    });

    it('renders suggested status when single contact', async () => {
      const { getByRole, findByRole } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.AppointmentInPerson,
            contacts: {
              nodes: [{ id: 'contact-1', name: 'Anderson, Robert' }],
            },
          }}
        />,
      );

      const resultDropdown = await findByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(
          getByRole('option', { name: 'Cancelled-Need to reschedule' }),
        );
      });

      expect(
        await findByRole('checkbox', {
          name: "Change the contact's status to: Initiate for Appointment",
        }),
      ).toBeInTheDocument();
    });

    it('does not render suggested status when the Phase Constant does not provide a suggested status', async () => {
      const { getByRole, queryByRole, findByRole } = render(
        <Components
          taskOverrides={{
            activityType: ActivityTypeEnum.InitiationEmail,
            contacts: {
              nodes: [{ id: 'contact-1', name: 'Anderson, Robert' }],
            },
          }}
        />,
      );

      const resultDropdown = await findByRole('combobox', { name: 'Result' });
      userEvent.click(resultDropdown);
      await waitFor(() => {
        userEvent.click(
          getByRole('option', { name: "Can't meet right now - circle back" }),
        );
      });

      await waitFor(() => {
        expect(
          queryByRole('checkbox', { name: /^Change the contact's status/ }),
        ).not.toBeInTheDocument();
      });
    });

    it('should not render <Result> if no result to select', async () => {
      const { queryByRole } = render(
        <Components
          taskOverrides={{
            activityType: '',
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
      const { getByRole, getAllByRole, queryByRole, findByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );

      const resultDropdown = await findByRole('combobox', { name: 'Result' });
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

    it('does not render the Next Actions when Result "Not Interested" is selected and next actions is null', async () => {
      const { getByRole, queryByRole, findByRole } = render(
        <Components
          taskOverrides={{ activityType: ActivityTypeEnum.AppointmentInPerson }}
        />,
      );
      userEvent.click(await findByRole('combobox', { name: 'Result' }));
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

      userEvent.click(await findByRole('combobox', { name: 'Result' }));
      userEvent.click(await findByRole('option', { name: 'Follow up' }));

      expect(
        getByRole('combobox', { name: 'Next Action' }),
      ).toBeInTheDocument();

      expect(getByRole('combobox', { name: 'Next Action' })).toHaveValue('');
    });
  });

  it('saves the default values correctly', async () => {
    const { getByRole } = render(<Components />);
    expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
      '01/01/2020',
    );
  });

  it('saves simple', async () => {
    const { getByText } = render(
      <Components
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

    const taskOverrides = {
      activityType: ActivityTypeEnum.FollowUpPhoneCall,
      completedAt,
      tagList: ['tag-1', 'tag-2'],
    };
    const { getByText, findByText, getByRole } = render(
      <Components taskOverrides={taskOverrides} />,
    );
    await waitFor(() => {
      expect(getByText(/subject/i)).toBeInTheDocument();
      userEvent.click(getByRole('combobox', { name: 'Result' }));
    });
    await waitFor(() => {
      userEvent.click(getByText('Partner-Special'));
      userEvent.click(getByRole('combobox', { name: 'Next Action' }));
      userEvent.click(getByRole('option', { name: 'Thank You Note' }));
    });

    expect(getByText('Suggested Tags')).toBeInTheDocument();
    userEvent.click(await findByText('Financial Support'));

    userEvent.click(getByText('Save'));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('CompleteTask', {
        accountListId: 'abc',
        attributes: {
          nextAction: ActivityTypeEnum.PartnerCareThank,
          result: ResultEnum.Completed,
          tagList: ['tag-1', 'tag-2', 'financial support'],
        },
      }),
    );
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
    const { findByRole, getByText } = render(
      <Components
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
    userEvent.click(await findByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'Partner-Special' }));
    userEvent.click(await findByRole('combobox', { name: 'Next Action' }));
    userEvent.click(await findByRole('option', { name: 'Thank You Note' }));

    userEvent.click(
      await findByRole('checkbox', {
        name: "Change the contact's status to: Partner - Special",
      }),
    );

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
    onErrorMock.mock.calls.forEach((call) => {
      expect(
        JSON.stringify(call[0]).includes('UpdateContactStatus'),
      ).toBeFalsy();
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('saves result as Completed when no activityType', async () => {
    const { getByRole } = render(
      <Components
        taskOverrides={{
          activityType: null,
          completedAt: DateTime.local(2015, 1, 5, 1, 2).toISO(),
        }}
      />,
    );
    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    onErrorMock.mock.calls.forEach((call) => {
      expect(JSON.stringify(call[0]).includes('CompleteTask')).toBeFalsy();
    });
  });

  it('saves comment', async () => {
    const { getByRole } = render(<Components />);
    userEvent.type(
      getByRole('textbox', { name: 'Add New Comment' }),
      'Comment',
    );
    userEvent.click(getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    onErrorMock.mock.calls.forEach((call) => {
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

  describe('flows status change message', () => {
    it('does not show by default', () => {
      const { queryByText } = render(<Components />);

      expect(
        queryByText(/The contact's status has been updated/),
      ).not.toBeInTheDocument();
    });

    it('shows when showFlowsMessage is set', () => {
      const { getByText } = render(
        <Components props={{ showFlowsMessage: true }} />,
      );

      expect(
        getByText(/The contact's status has been updated/),
      ).toBeInTheDocument();
    });
  });
});
