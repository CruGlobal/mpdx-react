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
import {
  getDataForTaskDrawerMock,
  createTaskMutationMock,
  updateTaskMutationMock,
  deleteTaskMutationMock,
} from './Form.mock';
import TaskDrawerForm from '.';

const accountListId = 'abc';

describe('TaskDrawerForm', () => {
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
    const { getByText, getByRole, findByText, queryByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskDrawerMock(accountListId),
              createTaskMutationMock(),
            ]}
            addTypename={false}
          >
            <TaskDrawerForm
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
    expect(await queryByText('Remove')).not.toBeInTheDocument();
    userEvent.type(getByRole('textbox', { name: 'Subject' }), accountListId);
    userEvent.click(getByRole('checkbox', { name: 'Notification' }));
    userEvent.type(getByRole('spinbutton', { name: 'Period' }), '20');
    userEvent.click(getByRole('checkbox', { name: 'Notification' }));
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 10000);

  it('persisted', async () => {
    const onClose = jest.fn();
    const { getByText, getByRole, getAllByRole } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskDrawerMock(accountListId),
              updateTaskMutationMock(),
            ]}
            addTypename={false}
          >
            <TaskDrawerForm
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
    userEvent.click(getByRole('button', { name: 'Type' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Type' })).getByText(
        ActivityTypeEnum.NewsletterEmail,
      ),
    );

    userEvent.type(
      getByRole('textbox', { name: 'Subject' }),
      'On the Journey with the Johnson Family',
    );

    const tagsElement = getByRole('textbox', { name: 'Tags' });
    userEvent.click(tagsElement);

    await new Promise((resolve) => setTimeout(resolve, 0));
    userEvent.click(
      await within(getByRole('presentation')).findByText('tag-1'),
    );
    userEvent.click(tagsElement);
    userEvent.click(within(getByRole('presentation')).getByText('tag-2'));

    const assigneeElement = getByRole('textbox', { name: 'Assignee' });
    userEvent.click(assigneeElement);
    userEvent.click(
      await within(getByRole('presentation')).findByText('Robert Anderson'),
    );

    const contactsElement = getByRole('textbox', { name: 'Contacts' });
    userEvent.click(contactsElement);
    userEvent.click(
      await within(getByRole('presentation')).findByText('Anderson, Robert'),
    );
    userEvent.click(contactsElement);
    userEvent.click(within(getByRole('presentation')).getByText('Smith, John'));

    userEvent.click(getByRole('checkbox', { name: 'Notification' }));
    userEvent.type(getByRole('spinbutton', { name: 'Period' }), '20');
    userEvent.click(getByRole('button', { name: 'Unit' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Unit' })).getByText('HOURS'),
    );
    userEvent.click(getByRole('button', { name: 'Platform' }));
    userEvent.click(
      within(getByRole('listbox', { name: 'Platform' })).getByText('BOTH'),
    );

    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
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
              getDataForTaskDrawerMock(accountListId),
              deleteTaskMutationMock(),
            ]}
            cache={cache}
            addTypename={false}
          >
            <TaskDrawerForm
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
    userEvent.click(getByRole('button', { name: 'Remove' }));
    expect(
      getByText('Are you sure you wish to delete the selected task?'),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Yes' }));
  });
});
