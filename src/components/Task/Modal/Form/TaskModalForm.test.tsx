import React from 'react';
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

const partnerCareDefaults = {
  taskPhase: PhaseEnum.PartnerCare,
  activityType: ActivityTypeEnum.PartnerCareTextMessage,
};

interface TestComponentProps {
  defaultValues?: TaskModalFormProps['defaultValues'];
  task?: TaskModalFormProps['task'];
  showFlowsMessage?: TaskModalFormProps['showFlowsMessage'];
}
const TestComponent = ({
  defaultValues,
  task,
  showFlowsMessage,
}: TestComponentProps) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <SnackbarProvider>
        <GqlMockedProvider>
          <TaskModalForm
            defaultValues={defaultValues}
            accountListId={accountListId}
            onClose={onClose}
            task={task}
            showFlowsMessage={showFlowsMessage}
          />
        </GqlMockedProvider>
      </SnackbarProvider>
    </LocalizationProvider>
  </ThemeProvider>
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
    const { getByText } = render(<TestComponent />);
    userEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Modal will not save if invalid data', async () => {
    const { findByText, getByRole, findByRole } = render(<TestComponent />);
    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Appointment' }));

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'In Person' }));

    userEvent.clear(getByRole('textbox', { name: /subject/i }));

    userEvent.click(getByRole('button', { name: 'Save' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(await findByText('Task Name is required')).toBeInTheDocument();
    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('preserves a custom task name when Action changes', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent defaultValues={partnerCareDefaults} />,
    );

    const taskName = await findByRole('textbox', { name: 'Subject' });
    expect(taskName).toHaveValue('Text Message Partner For Cultivation');

    userEvent.clear(taskName);
    userEvent.type(taskName, 'Tam wuz here');

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Email' }));

    expect(await findByRole('combobox', { name: 'Action' })).toHaveValue(
      'Email',
    );

    expect(taskName).toHaveValue('Tam wuz here');
  });

  it('autofills the taskname when the taskname is empty', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent defaultValues={partnerCareDefaults} />,
    );

    const taskName = await findByRole('textbox', { name: 'Subject' });
    expect(taskName).toHaveValue('Text Message Partner For Cultivation');
    userEvent.clear(taskName);

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Email' }));

    expect(taskName).toHaveValue('Email Partner For Cultivation');
  });

  it('overwrites the task name when it still holds the previous action default', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent defaultValues={partnerCareDefaults} />,
    );

    const taskName = await findByRole('textbox', { name: 'Subject' });
    expect(taskName).toHaveValue('Text Message Partner For Cultivation');

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Email' }));

    expect(taskName).toHaveValue('Email Partner For Cultivation');
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
          subject: 'Do something',
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
      <TestComponent task={mockTask} />,
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
    userEvent.click(getByRole('option', { name: 'Social Media Message' }));
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
      <TestComponent
        defaultValues={{ ...partnerCareDefaults, subject: 'Do something' }}
      />,
    );

    expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Do something',
    );
  });

  it('defaults the subject to the name based on phase and action', () => {
    const { getByRole } = render(
      <TestComponent defaultValues={partnerCareDefaults} />,
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
    userEvent.click(getByRole('option', { name: 'Cancelled' }));

    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(getByRole('option', { name: 'Email' }));
  });

  it('deletes a task', async () => {
    const { getByRole } = render(<TestComponent task={mockTask} />);

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
    userEvent.click(await findByRole('option', { name: 'Follow Up' }));

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
      const { queryByText } = render(<TestComponent />);

      expect(
        queryByText(/The contact's status has been updated/),
      ).not.toBeInTheDocument();
    });

    it('shows when showFlowsMessage is set', () => {
      const { getByText } = render(<TestComponent showFlowsMessage />);

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

      expect(getByRole('textbox', { name: 'Subject' })).toHaveValue('Subject');
    });

    it('renames the task when the task phase changes and the name is a default', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent
          task={{ ...mockCompletedTask, subject: 'In Person Appointment' }}
        />,
      );

      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      userEvent.click(await findByRole('option', { name: 'Follow-Up' }));

      expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
        'Follow Up In Person',
      );
    });
  });
});
