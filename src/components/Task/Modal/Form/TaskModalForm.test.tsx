import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { DateTime } from 'luxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import {
  getDataForTaskModalMock,
  createTaskMutationMock,
  updateTaskMutationMock,
  deleteTaskMutationMock,
} from './TaskModalForm.mock';
import TaskModalForm from './TaskModalForm';
import { debug } from 'console';
import { TasksDocument } from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';

const accountListId = 'abc';

debug(undefined, Infinity);

describe('TaskModalForm', () => {
  const mockFilter = {
    userIds: [],
    tags: [],
    contactIds: [],
    activityType: [],
    completed: null,
    startAt: null,
    before: null,
    after: null,
  };

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
    subject: '',
    tagList: [],
    user: null,
  };

  it('default', async () => {
    const onClose = jest.fn();
    const { getByText, findByText, queryByText, getByLabelText, getByRole } =
      render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <MockedProvider
              mocks={[
                getDataForTaskModalMock(accountListId),
                createTaskMutationMock(),
              ]}
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
    expect(await queryByText('Delete')).not.toBeInTheDocument();
    userEvent.type(getByLabelText('Subject'), accountListId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const contactsElement = getByRole('combobox', {
      hidden: true,
      name: 'Contacts',
    });

    userEvent.type(contactsElement, 'Smith');

    const commentsBox = getByRole('textbox', {
      hidden: true,
      name: 'Comment',
    });

    expect(queryByText('test comment')).not.toBeInTheDocument();
    userEvent.type(commentsBox, 'test comment');
    expect(getByText('test comment')).toBeInTheDocument();

    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
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
            mocks={[
              getDataForTaskModalMock(accountListId),
              updateTaskMutationMock(),
            ]}
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Type' }));
    expect(getByText('Both')).toBeInTheDocument();
    userEvent.click(getByText('Both'));
    expect(queryByText('Hours')).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { hidden: true, name: 'Unit' }));
    expect(getByText('Hours')).toBeInTheDocument();
    userEvent.click(getByText('Hours'));
  }, 25000);

  it('show the location field appropriately', async () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText, queryByLabelText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskModalMock(accountListId),
              updateTaskMutationMock(),
            ]}
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

    expect(queryByLabelText('Location')).not.toBeInTheDocument();

    userEvent.click(getByLabelText('Action'));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'Appointment',
      ),
    );
    expect(queryByLabelText('Location')).toBeInTheDocument();

    userEvent.type(getByLabelText('Location'), '123 Test Street');

    userEvent.click(getByRole('listbox', { hidden: true, name: 'Action' }));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'Call',
      ),
    );

    expect(queryByLabelText('Location')).not.toBeInTheDocument();
  }, 25000);

  it('should load and show data for task', async () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText, getByText, queryByTestId } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[getDataForTaskModalMock(accountListId)]}
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

    await new Promise((resolve) => setTimeout(resolve, 0));
    const tagsElement = getByLabelText('Tags');
    userEvent.click(tagsElement);
    expect(queryByTestId('loading')).not.toBeInTheDocument();
    await waitFor(() => expect(getByText('tag-1')).toBeInTheDocument());
    await waitFor(() => expect(getByText('tag-2')).toBeInTheDocument());
    userEvent.click(
      await within(getByRole('presentation')).findByText('tag-1'),
    );
    userEvent.click(tagsElement);

    const assigneeElement = getByRole('combobox', {
      hidden: true,
      name: 'Assignee',
    });
    userEvent.click(assigneeElement);
    userEvent.type(assigneeElement, 'Robert');
    await waitFor(() =>
      expect(getByText('Robert Anderson')).toBeInTheDocument(),
    );
    userEvent.click(
      await within(getByRole('presentation')).findByText('Robert Anderson'),
    );

    const contactsElement = getByRole('combobox', {
      hidden: true,
      name: 'Contacts',
    });

    userEvent.click(contactsElement);
    await waitFor(() => expect(getByText('Smith, John')).toBeInTheDocument());
    userEvent.click(
      await within(getByRole('presentation')).findByText('Anderson, Robert'),
    );
    userEvent.type(contactsElement, 'Smith');
    userEvent.click(contactsElement);
  }, 25000);

  it('renders fields for completed task', async () => {
    const onClose = jest.fn();
    const { getByRole, getAllByRole, queryByText, getByText, getByLabelText } =
      render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <MockedProvider
              mocks={[
                getDataForTaskModalMock(accountListId),
                updateTaskMutationMock(),
              ]}
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
    expect(
      getAllByRole('textbox').find(
        (item) => (item as HTMLInputElement).value === '1/5/2016',
      ),
    ).toBeInTheDocument();
    expect(queryByText('Notifications')).not.toBeInTheDocument();
    await waitFor(() => expect(getByText('Result')).toBeInTheDocument());
    expect(queryByText('Completed')).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { hidden: true, name: 'Result' }));
    expect(getByText('Completed')).toBeInTheDocument();
    userEvent.click(getByText('Completed'));
    await waitFor(() =>
      expect(getByLabelText('Next Action')).toBeInTheDocument(),
    );
    expect(queryByText('Call')).not.toBeInTheDocument();
    userEvent.click(getByRole('button', { hidden: true, name: 'Next Action' }));
    expect(getByText('Call')).toBeInTheDocument();
    userEvent.click(getByText('Call'));
  }, 2500);

  it('deletes a task', async () => {
    const onClose = jest.fn();
    const cache = new InMemoryCache({ addTypename: false });
    jest.spyOn(cache, 'writeQuery');
    jest.spyOn(cache, 'readQuery');
    const query = {
      query: TasksDocument,
      variables: {
        accountListId,
        first: 100,
        ...mockFilter,
      },
      data: {
        tasks: {
          nodes: [{ ...mockTask }],
        },
      },
    };
    cache.writeQuery(query);
    const { getByText, getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskModalMock(accountListId),
              deleteTaskMutationMock(),
            ]}
            cache={cache}
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
    userEvent.click(getByRole('button', { hidden: true, name: 'Delete' }));
    expect(getByText('Confirm')).toBeInTheDocument();

    userEvent.click(getByRole('button', { hidden: true, name: 'Yes' }));
  });
});
