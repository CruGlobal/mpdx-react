import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime, Settings } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssigneeOptionsQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { ContactOptionsQuery } from './Inputs/ContactsAutocomplete/ContactsAutocomplete.generated';
import { TagOptionsQuery } from './Inputs/TagsAutocomplete/TagsAutocomplete.generated';
import TaskModalForm from './TaskModalForm';
import {
  createTasksMutationMock,
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
    activityType: ActivityTypeEnum.Email,
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
    user: null,
  };

  beforeEach(() => {
    // Create a stable time so that the "now" in the component will match "now" in the mocks
    const now = Date.now();
    Settings.now = () => now;
  });

  it('Modal will not save if invalid data', async () => {
    const onClose = jest.fn();
    const { getByText, findByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[createTasksMutationMock()]}
            addTypename={false}
          >
            <TaskModalForm accountListId={accountListId} onClose={onClose} />
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );
    userEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
    onClose.mockClear();
    userEvent.click(getByText('Save'));
    expect(await findByText('Field is required')).toBeInTheDocument();
    await waitFor(() => expect(onClose).not.toHaveBeenCalled());
  });

  it('modal save data', async () => {
    const onClose = jest.fn();
    const mutationSpy = jest.fn();

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

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    userEvent.click(await findByRole('option', { name: 'Contact 2' }));

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    userEvent.click(await findByRole('option', { name: 'User 2' }));

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    userEvent.click(await findByRole('option', { name: 'tag-2' }));

    userEvent.type(getByRole('textbox', { name: 'Comment' }), 'test comment');

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
    const onClose = jest.fn();
    const {
      getByRole,
      getByLabelText,
      queryByLabelText,
      getByText,
      queryByText,
      queryByRole,
    } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[updateTaskMutationMock()]}
            addTypename={false}
          >
            <TaskModalForm
              accountListId={accountListId}
              onClose={onClose}
              task={mockTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );
    userEvent.click(getByLabelText('Action'));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'Newsletter - Email',
      ),
    );

    userEvent.type(
      getByLabelText('Subject'),
      'On the Journey with the Johnson Family',
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

    expect(getByText('Notifications')).toBeInTheDocument();
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
    const onClose = jest.fn();
    const { getByRole, queryByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[updateTaskMutationMock()]}
            addTypename={false}
          >
            <TaskModalForm
              accountListId={accountListId}
              onClose={onClose}
              task={mockTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    expect(
      queryByRole('textbox', { name: 'Location' }),
    ).not.toBeInTheDocument();

    const action = getByRole('combobox', { name: 'Action' });
    userEvent.click(action);
    userEvent.click(getByRole('option', { name: 'Appointment' }));
    expect(getByRole('textbox', { name: 'Location' })).toBeInTheDocument();

    userEvent.click(action);
    userEvent.click(getByRole('option', { name: 'Call' }));
    expect(
      queryByRole('textbox', { name: 'Location' }),
    ).not.toBeInTheDocument();
  }, 25000);

  it('defaults the assignee to the logged in user', async () => {
    const onClose = jest.fn();
    const mutationSpy = jest.fn();

    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            AssigneeOptions: AssigneeOptionsQuery;
            GetUser: GetUserQuery;
          }>
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
              GetUser: {
                user: {
                  id: 'user-1',
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

    await waitFor(() =>
      expect(getByRole('combobox', { name: 'Assignee' })).toHaveValue('User 1'),
    );
  });

  it('renders fields for completed task', async () => {
    const onClose = jest.fn();
    const { getByRole, queryByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[updateTaskMutationMock()]}
            addTypename={false}
          >
            <TaskModalForm
              accountListId={accountListId}
              onClose={onClose}
              task={mockCompletedTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    expect(getByRole('textbox', { name: /^Choose date/ })).toHaveValue(
      '01/05/2016',
    );
    expect(queryByText('Notifications')).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(getByRole('option', { name: 'Completed' }));

    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(getByRole('option', { name: 'Call' }));
  }, 2500);

  it('deletes a task', async () => {
    const onClose = jest.fn();
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[deleteTaskMutationMock()]}
            addTypename={false}
          >
            <TaskModalForm
              accountListId={accountListId}
              onClose={onClose}
              task={mockTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Delete' }));
    expect(getByRole('heading', { name: 'Confirm' })).toBeInTheDocument();
    userEvent.click(getByRole('button', { name: 'Yes' }));
  });

  it('opens new task modal when activity type changes', async () => {
    const onClose = jest.fn();
    const { getByRole } = render(
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
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(getByRole('option', { name: 'Appointment' }));
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        view: 'add',
        defaultValues: {
          subject: mockCompletedTask.subject,
          activityType: ActivityTypeEnum.Appointment,
          contactIds: [],
          tagList: [],
        },
      }),
    );
  });
});
