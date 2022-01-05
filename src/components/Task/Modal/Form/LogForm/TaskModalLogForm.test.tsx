import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { SnackbarProvider } from 'notistack';
import { DateTime } from 'luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { ActivityTypeEnum } from '../../../../../../graphql/types.generated';
import { GetTasksForTaskListDocument } from '../../../List/TaskList.generated';
import {
  getDataForTaskModalMock,
  updateTaskMutationMock,
  deleteTaskMutationMock,
  logTaskMutationMock,
} from '../TaskModalForm.mock';
import TaskModalLogForm from './TaskModalLogForm';

const accountListId = 'abc';

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

describe('TaskModalLogForm', () => {
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
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const { getByText, findByText, queryByText, getByLabelText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskModalMock(accountListId),
              logTaskMutationMock(),
            ]}
            addTypename={false}
          >
            <TaskModalLogForm
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
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());

    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.attributes).toEqual({});
  }, 10000);

  it('persisted', async () => {
    const onClose = jest.fn();
    const {
      getByRole,
      getAllByRole,
      getByLabelText,
      queryByLabelText,
    } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskModalMock(accountListId),
              updateTaskMutationMock(),
            ]}
            addTypename={false}
          >
            <TaskModalLogForm
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
    expect(queryByLabelText('Comment')).not.toBeInTheDocument();
    expect(queryByLabelText('Tags')).not.toBeInTheDocument();
    expect(queryByLabelText('Assignee')).not.toBeInTheDocument();
    expect(queryByLabelText('Next Action')).not.toBeInTheDocument();
    userEvent.click(getByLabelText('Show More'));
    expect(getByLabelText('Comment')).toBeInTheDocument();
    expect(getByLabelText('Tags')).toBeInTheDocument();
    expect(getByLabelText('Assignee')).toBeInTheDocument();
    expect(getByLabelText('Next Action')).toBeInTheDocument();
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
            <TaskModalLogForm
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
    expect(mockEnqueue).toHaveBeenCalledWith('Task deleted successfully', {
      variant: 'success',
    });
  });
});
