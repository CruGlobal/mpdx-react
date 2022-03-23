import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { DateTime } from 'luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { ActivityTypeEnum } from '../../../../../graphql/types.generated';
import { GetTasksForTaskListDocument } from '../../List/TaskList.generated';
import { getDataForTaskDrawerMock } from '../../Drawer/Form/Form.mock';
import {
  getDataForTaskModalMock,
  createTaskMutationMock,
  updateTaskMutationMock,
  deleteTaskMutationMock,
} from './TaskModalForm.mock';
import TaskModalForm from './TaskModalForm';

const accountListId = 'abc';

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
    completedAt: DateTime.local(2016, 1, 5, 1, 2).toISO(),
    subject: '',
    tagList: [],
    user: null,
  };

  it('default', async () => {
    const onClose = jest.fn();
    const {
      getByText,
      findByText,
      queryByText,
      getByLabelText,
      getByRole,
    } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskModalMock(accountListId),
              createTaskMutationMock(),
            ]}
            addTypename={false}
          >
            <TaskModalForm
              accountListId={accountListId}
              filter={mockFilter}
              rowsPerPage={100}
              onClose={onClose}
            />
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    userEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
    onClose.mockClear();
    userEvent.click(getByText('Save'));
    expect(await findByText('Field is required')).toBeInTheDocument();
    expect(await queryByText('Delete')).not.toBeInTheDocument();
    userEvent.type(getByLabelText('Subject'), accountListId);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const contactsElement = getByRole('textbox', {
      hidden: true,
      name: 'Contacts',
    });

    userEvent.type(contactsElement, 'Smith');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 10000);

  it('persisted', async () => {
    const onClose = jest.fn();
    const { getByRole, getAllByRole, getByLabelText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
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
              filter={mockFilter}
              rowsPerPage={100}
              onClose={onClose}
              task={mockTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    expect(
      getAllByRole('textbox').find(
        (item) => (item as HTMLInputElement).value === 'Jan 5, 2016',
      ),
    ).toBeInTheDocument();
    userEvent.click(getByLabelText('Action'));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        ActivityTypeEnum.NewsletterEmail,
      ),
    );

    userEvent.type(
      getByLabelText('Subject'),
      'On the Journey with the Johnson Family',
    );

    const tagsElement = getByLabelText('Tags');
    userEvent.click(tagsElement);
    userEvent.type(getByLabelText('Period'), '20');
    userEvent.click(getByLabelText(/unit of time/i));
    userEvent.click(
      within(
        getByRole('listbox', { hidden: true, name: 'Unit of time' }),
      ).getByText('HOURS'),
    );
    userEvent.click(getByLabelText(/notify me before due date by/i));
    userEvent.click(
      within(
        getByRole('listbox', {
          hidden: true,
          name: 'Notify me before due date by',
        }),
      ).getByText('BOTH'),
    );
  }, 25000);

  it('should load and show data for task', async () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText, getByText, queryByTestId } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[getDataForTaskDrawerMock(accountListId)]}
            addTypename={false}
          >
            <TaskModalForm
              accountListId={accountListId}
              filter={mockFilter}
              rowsPerPage={100}
              onClose={onClose}
              task={mockTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
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

    const assigneeElement = getByRole('textbox', {
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

    const contactsElement = getByRole('textbox', {
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

  it('deletes a task', async () => {
    const onClose = jest.fn();
    const cache = new InMemoryCache({ addTypename: false });
    jest.spyOn(cache, 'writeQuery');
    jest.spyOn(cache, 'readQuery');
    const query = {
      query: GetTasksForTaskListDocument,
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
      <MuiPickersUtilsProvider utils={LuxonUtils}>
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
              filter={mockFilter}
              rowsPerPage={100}
              onClose={onClose}
              task={mockTask}
            />
          </MockedProvider>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Delete' }));
    expect(
      getByText('Are you sure you wish to delete the selected task?'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { hidden: true, name: 'Yes' }));
  });
});
