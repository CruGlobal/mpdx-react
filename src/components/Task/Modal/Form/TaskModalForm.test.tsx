import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@emotion/react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssigneeOptionsQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { ActivityTypeEnum, PhaseEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
import { TaskModalEnum } from '../TaskModal';
import { ContactOptionsQuery } from './Inputs/ContactsAutocomplete/ContactsAutocomplete.generated';
import { TagOptionsQuery } from './Inputs/TagsAutocomplete/TagsAutocomplete.generated';
import TaskModalForm, { TaskModalFormProps } from './TaskModalForm';
import {
  deleteTaskMutationMock,
  updateTaskMutationMock,
} from './TaskModalForm.mock';

jest.mock('src/hooks/useTaskModal');

const openTaskModal = jest.fn();
beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

const accountListId = 'abc';
const onClose = jest.fn();
const mutationSpy = jest.fn();

interface ComponentsProps {
  mocks?: MockedResponse<Record<string, unknown>>[];
  mockTask?: TaskModalFormProps['task'];
}
const Components = ({ mocks = [], mockTask = undefined }: ComponentsProps) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <SnackbarProvider>
      <MockedProvider mocks={mocks} addTypename={false}>
        <TaskModalForm
          accountListId={accountListId}
          onClose={onClose}
          task={mockTask}
        />
      </MockedProvider>
    </SnackbarProvider>
  </LocalizationProvider>
);

describe('TaskModalForm', () => {
  const mockTask = {
    activityType: null,
    contacts: {
      nodes: [],
    },
    id: 'task-1',
    notificationTimeBefore: null,
    notificationTimeUnit: null,
    notificationType: null,
    startAt: DateTime.local(2013, 1, 5, 1, 2).toISO(),
    subject: '',
    tagList: [],
    user: null,
  };

  const mockCompletedTask = {
    taskPhase: PhaseEnum.Appointment,
    activityType: ActivityTypeEnum.AppointmentInPerson,
    contacts: {
      nodes: [],
    },
    id: 'task-2',
    notificationTimeBefore: null,
    notificationTimeUnit: null,
    notificationType: null,
    startAt: DateTime.local(2013, 1, 5, 1, 2).toISO(),
    completedAt: DateTime.local(2016, 1, 5, 1, 2).toISO(),
    subject: 'Subject',
    tagList: [],
    user: {
      id: 'userId',
    },
  };

  it('Modal should close', async () => {
    const { getByText } = render(<Components />);
    userEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Modal will not save if invalid data', async () => {
    const { findByText, getByRole, findByRole } = render(<Components />);
    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Appointment' }));

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'In Person' }));

    userEvent.clear(getByRole('textbox', { name: /subject/i }));

    userEvent.click(getByRole('button', { name: 'Save' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(await findByText('Field is required')).toBeInTheDocument();
    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('modal save data', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            AssigneeOptions: AssigneeOptionsQuery;
            ContactOptions: ContactOptionsQuery;
            TagOptions: TagOptionsQuery;
          }>
            mocks={{
              AssigneeOptions: {
                accountListUsers: {
                  nodes: [
                    {
                      user: { id: 'user-1', firstName: 'User', lastName: '1' },
                    },
                    {
                      user: { id: 'user-2', firstName: 'User', lastName: '2' },
                    },
                  ],
                },
              },
              ContactOptions: {
                contacts: {
                  nodes: [
                    { id: 'contact-1', name: 'Contact 1' },
                    { id: 'contact-2', name: 'Contact 2' },
                  ],
                },
              },
              TagOptions: {
                accountList: {
                  taskTagList: ['tag-1', 'tag-2'],
                },
              },
            }}
            onCall={mutationSpy}
          >
            <TaskModalForm accountListId={accountListId} onClose={onClose} />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    expect(queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

    userEvent.type(getByRole('textbox', { name: 'Subject' }), 'Do something');

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Appointment' }));

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'In Person' }));

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    userEvent.click(await findByRole('option', { name: 'Contact 2' }));

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    userEvent.click(await findByRole('option', { name: 'User 2' }));

    expect(getByRole('combobox', { name: 'Tags' })).toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    userEvent.click(await findByRole('option', { name: 'tag-2' }));

    userEvent.type(getByRole('textbox', { name: 'Comment' }), 'test comment');

    await waitFor(() =>
      expect(getByRole('button', { name: 'Save' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(mutationSpy.mock.lastCall[0].operation).toMatchObject({
      operationName: 'CreateTasks',
      variables: {
        accountListId,
        attributes: {
          subject: 'In Person Appointment',
          userId: 'user-2',
          contactIds: ['contact-2'],
          tagList: ['tag-2'],
          comment: 'test comment',
        },
      },
    });
  }, 10000);

  it('persisted', async () => {
    const {
      getByRole,
      findByRole,
      getByLabelText,
      queryByLabelText,
      getByText,
      queryByText,
      queryByRole,
    } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            AssigneeOptions: AssigneeOptionsQuery;
            ContactOptions: ContactOptionsQuery;
            TagOptions: TagOptionsQuery;
          }>
            mocks={{
              AssigneeOptions: {
                accountListUsers: {
                  nodes: [
                    {
                      user: { id: 'user-1', firstName: 'User', lastName: '1' },
                    },
                    {
                      user: { id: 'user-2', firstName: 'User', lastName: '2' },
                    },
                  ],
                },
              },
              ContactOptions: {
                contacts: {
                  nodes: [
                    { id: 'contact-1', name: 'Contact 1' },
                    { id: 'contact-2', name: 'Contact 2' },
                  ],
                },
              },
              TagOptions: {
                accountList: {
                  taskTagList: ['tag-1', 'tag-2'],
                },
              },
            }}
            onCall={mutationSpy}
          >
            <TaskModalForm
              accountListId={accountListId}
              onClose={onClose}
              task={mockTask}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.click(await findByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Partner Care' }));

    userEvent.click(await findByRole('combobox', { name: 'Action' }));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'Digital Newsletter',
      ),
    );

    expect(await findByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Send Digital Newsletter',
    );

    expect(queryByLabelText('Result')).not.toBeInTheDocument();

    const tagsElement = getByLabelText('Tags');
    userEvent.click(tagsElement);

    const dateSelector = getByRole('textbox', {
      hidden: true,
      name: 'Choose date, selected date is Jan 5, 2013',
    });

    expect(
      queryByRole('gridcell', { hidden: true, name: '17' }),
    ).not.toBeInTheDocument();
    userEvent.click(dateSelector);
    const date17 = getByRole('gridcell', { hidden: true, name: '17' });
    userEvent.click(date17);
    userEvent.click(getByRole('button', { hidden: true, name: 'OK' }));

    expect(
      getByRole('textbox', {
        hidden: true,
        name: 'Choose date, selected date is Jan 17, 2013',
      }),
    ).toBeInTheDocument();

    expect(getByText('Reminders')).toBeInTheDocument();
    expect(queryByText('Both')).not.toBeInTheDocument();
    userEvent.click(getByRole('combobox', { hidden: true, name: 'Type' }));
    expect(getByText('Both')).toBeInTheDocument();
    userEvent.click(getByText('Both'));
    expect(queryByText('Hours')).not.toBeInTheDocument();
    userEvent.click(getByRole('combobox', { hidden: true, name: 'Unit' }));
    expect(getByText('Hours')).toBeInTheDocument();
    userEvent.click(getByText('Hours'));
  }, 25000);

  it('show the location field appropriately', async () => {
    const { getByRole, findByRole, queryByRole } = render(
      <Components mocks={[updateTaskMutationMock()]} mockTask={mockTask} />,
    );

    expect(
      queryByRole('textbox', { name: 'Location' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Follow-Up' }));

    const action = getByRole('combobox', { name: 'Action' });
    userEvent.click(action);
    userEvent.click(await findByRole('option', { name: 'In Person' }));
    expect(getByRole('textbox', { name: 'Location' })).toBeInTheDocument();

    userEvent.click(action);
    userEvent.click(getByRole('option', { name: 'Social Media' }));
    expect(
      queryByRole('textbox', { name: 'Location' }),
    ).not.toBeInTheDocument();
  }, 25000);

  it('defaults the assignee to the logged in user', async () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider<{ AssigneeOptions: AssigneeOptionsQuery }>
            mocks={{
              AssigneeOptions: {
                accountListUsers: {
                  nodes: [
                    {
                      user: { id: 'user-1', firstName: 'User', lastName: '1' },
                    },
                  ],
                },
              },
            }}
            onCall={mutationSpy}
          >
            <TaskModalForm
              accountListId={accountListId}
              onClose={onClose}
              task={null}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    await waitFor(() =>
      expect(getByRole('combobox', { name: 'Assignee' })).toHaveValue('User 1'),
    );
  });

  it('defaults the subject to the defaultValues subject', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider>
            <TaskModalForm
              defaultValues={{
                taskPhase: PhaseEnum.PartnerCare,
                activityType: ActivityTypeEnum.PartnerCareTextMessage,
                subject: 'Do something',
              }}
              accountListId={accountListId}
              onClose={onClose}
              task={null}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Do something',
    );
  });

  it('defaults the subject to the name based on phase and action', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider>
            <TaskModalForm
              defaultValues={{
                taskPhase: PhaseEnum.PartnerCare,
                activityType: ActivityTypeEnum.PartnerCareTextMessage,
              }}
              accountListId={accountListId}
              onClose={onClose}
              task={null}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Text Message Partner For Cultivation',
    );
  });

  it('renders fields for completed task', async () => {
    const { getByRole, findByRole, queryByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider onCall={mutationSpy}>
              <TaskModalForm
                accountListId={accountListId}
                onClose={onClose}
                task={mockCompletedTask}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    expect(
      await findByRole('option', { name: 'Partner Care' }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getByRole('option', { name: 'Appointment' })).toBeInTheDocument();
    });

    expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
      '01/05/2016',
    );
    expect(queryByText('Reminders')).not.toBeInTheDocument();

    expect(getByRole('combobox', { name: 'Action' })).toHaveValue('In Person');

    userEvent.click(await findByRole('combobox', { name: 'Result' }));
    userEvent.click(
      getByRole('option', { name: 'Cancelled-Need to reschedule' }),
    );

    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(getByRole('option', { name: 'Email' }));
  });

  it('deletes a task', async () => {
    const { getByRole } = render(
      <Components mocks={[deleteTaskMutationMock()]} mockTask={mockTask} />,
    );

    userEvent.click(getByRole('button', { name: 'Delete' }));
    expect(getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Yes' }));
  });

  it('opens new task modal when activity type changes', async () => {
    const { getByRole, findByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <TaskModalForm
                accountListId={accountListId}
                onClose={onClose}
                task={mockCompletedTask}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    userEvent.click(await findByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'Follow up' }));

    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(await findByRole('option', { name: 'In Person' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        view: TaskModalEnum.Add,
        defaultValues: {
          activityType: ActivityTypeEnum.FollowUpInPerson,
          contactIds: [],
          tagList: [],
          userId: mockCompletedTask.user.id,
        },
      }),
    );
  });

  describe('flows status change message', () => {
    it('does not show by default', () => {
      const { queryByText } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <TaskModalForm accountListId={accountListId} onClose={onClose} />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>,
      );

      expect(
        queryByText(/The contact's status has been updated/),
      ).not.toBeInTheDocument();
    });

    it('shows when showFlowsMessage is set', () => {
      const { getByText } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <TaskModalForm
                accountListId={accountListId}
                onClose={onClose}
                showFlowsMessage
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>,
      );

      expect(
        getByText(/The contact's status has been updated/),
      ).toBeInTheDocument();
    });

    it('Keeps valid actions when task phase changes', async () => {
      const { getByRole, findByRole } = render(
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <GqlMockedProvider>
                <TaskModalForm
                  accountListId={accountListId}
                  onClose={onClose}
                  task={mockCompletedTask}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>,
      );
      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      expect(
        await findByRole('option', { name: 'Partner Care' }),
      ).toBeInTheDocument();

      expect(getByRole('combobox', { name: 'Action' })).toHaveValue(
        'In Person',
      );
      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      userEvent.click(await findByRole('option', { name: 'Follow-Up' }));

      expect(getByRole('combobox', { name: 'Action' })).toHaveValue(
        'In Person',
      );

      expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
        'Follow Up In Person',
      );
    });
  });
});
