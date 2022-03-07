import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { DateTime } from 'luxon';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import userEvent from '@testing-library/user-event';
import { InMemoryCache } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { ActivityTypeEnum } from '../../../../../../graphql/types.generated';
import { GetTasksForTaskListDocument } from '../../../List/TaskList.generated';
import useTaskModal from '../../../../../hooks/useTaskModal';
import TaskModalLogForm from './TaskModalLogForm';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import TestRouter from '__tests__/util/TestRouter';
import {
  CreateTaskMutation,
  DeleteTaskMutation,
  UpdateTaskMutation,
} from 'src/components/Task/Drawer/Form/TaskDrawer.generated';
import {
  getDataForTaskDrawerMock,
  updateTaskMutationMock,
} from 'src/components/Task/Drawer/Form/Form.mock';

const accountListId = 'abc';

const mockEnqueue = jest.fn();
jest.mock('../../../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
};

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
});

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
      nodes: [{ id: 'contact-1', name: 'Anderson, Robert' }],
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
          <TestRouter router={router}>
            <GqlMockedProvider<CreateTaskMutation>
              addTypename={false}
              onCall={mutationSpy}
            >
              <TaskModalLogForm
                accountListId={accountListId}
                filter={mockFilter}
                rowsPerPage={100}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </TestRouter>
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
    expect(openTaskModal).not.toHaveBeenCalled();
  }, 10000);

  it('persisted', async () => {
    const onClose = jest.fn();
    const {
      getByRole,
      getAllByRole,
      getByLabelText,
      queryByLabelText,
      getByText,
    } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<UpdateTaskMutation> addTypename={false}>
              <TaskModalLogForm
                accountListId={accountListId}
                filter={mockFilter}
                rowsPerPage={100}
                onClose={onClose}
                task={mockTask}
              />
            </GqlMockedProvider>
          </TestRouter>
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
    userEvent.type(getByLabelText('Comment'), 'test comment');
    expect(getByLabelText('Tags')).toBeInTheDocument();
    expect(getByLabelText('Assignee')).toBeInTheDocument();
    expect(getByLabelText('Next Action')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 25000);

  it('should load and show data for task', async () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText, getByText } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskDrawerMock(accountListId),
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
    userEvent.click(getByLabelText('Show More'));
    const tagsElement = getByLabelText('Tags');
    userEvent.click(tagsElement);

    await new Promise((resolve) => setTimeout(resolve, 0));
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

    await waitFor(() =>
      expect(getByText('Robert Anderson')).toBeInTheDocument(),
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
    userEvent.click(contactsElement);
    userEvent.click(within(getByRole('presentation')).getByText('Smith, John'));
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
          <TestRouter router={router}>
            <GqlMockedProvider<DeleteTaskMutation>
              addTypename={false}
              cache={cache}
            >
              <TaskModalLogForm
                accountListId={accountListId}
                filter={mockFilter}
                rowsPerPage={100}
                onClose={onClose}
                task={mockTask}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Delete' }));
    expect(
      getByText('Are you sure you wish to delete the selected task?'),
    ).toBeInTheDocument();
    userEvent.click(getByRole('button', { hidden: true, name: 'No' }));
    await waitFor(() => expect(mockEnqueue).not.toHaveBeenCalled());
    userEvent.click(getByRole('button', { hidden: true, name: 'Delete' }));
    userEvent.click(getByRole('button', { hidden: true, name: 'Yes' }));
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Task deleted successfully', {
        variant: 'success',
      }),
    );
  });

  it('opens the next action modal', async () => {
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const {
      findByText,
      queryByText,
      getByText,
      getByRole,
      getByLabelText,
    } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<CreateTaskMutation> onCall={mutationSpy}>
              <TaskModalLogForm
                accountListId={accountListId}
                filter={mockFilter}
                rowsPerPage={100}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </MuiPickersUtilsProvider>,
    );

    userEvent.click(getByLabelText('Show More'));
    userEvent.click(getByLabelText('Next Action'));
    userEvent.click(
      within(
        getByRole('listbox', { hidden: true, name: 'Next Action' }),
      ).getByText(ActivityTypeEnum.Call),
    );
    userEvent.click(getByText('Save'));
    expect(await findByText('Field is required')).toBeInTheDocument();
    expect(await queryByText('Delete')).not.toBeInTheDocument();
    userEvent.type(getByLabelText('Subject'), accountListId);
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(openTaskModal).toHaveBeenCalled();
  }, 10000);
});
