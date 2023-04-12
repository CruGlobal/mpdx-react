import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { dispatch } from 'src/lib/analytics';
import useTaskModal from '../../../../../hooks/useTaskModal';
import TaskModalLogForm from './TaskModalLogForm';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import TestRouter from '__tests__/util/TestRouter';
import {
  CreateTasksMutation,
  GetTaskModalContactsFilteredQuery,
  UpdateTaskMutation,
} from 'src/components/Task/Modal/Form/TaskModal.generated';
import {
  getDataForTaskModalMock,
  updateTaskMutationMock,
} from 'src/components/Task/Modal/Form/TaskModalForm.mock';

const accountListId = 'abc';

const mockEnqueue = jest.fn();
jest.mock('../../../../../hooks/useTaskModal');

jest.mock('src/lib/analytics');

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
  it('default', async () => {
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const { getByText, findByText, getByLabelText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<CreateTasksMutation>
              addTypename={false}
              onCall={mutationSpy}
            >
              <TaskModalLogForm
                accountListId={accountListId}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>,
    );
    userEvent.click(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
    onClose.mockClear();
    userEvent.click(getByText('Save'));
    expect(await findByText('Field is required')).toBeInTheDocument();
    userEvent.type(getByLabelText('Subject'), accountListId);
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(dispatch).toHaveBeenCalledWith('mpdx-task-completed');
    const { operation } = mutationSpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(openTaskModal).not.toHaveBeenCalled();
  }, 10000);

  it('dispatches multiple events for multiple contacts', async () => {
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const { findByRole, getByText, getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<GetTaskModalContactsFilteredQuery>
              onCall={mutationSpy}
              mocks={{
                GetTaskModalContactsFiltered: {
                  contacts: {
                    nodes: [1, 2, 3].map((id) => ({
                      id: id.toString(),
                      name: `Contact ${id}`,
                    })),
                  },
                },
              }}
            >
              <TaskModalLogForm
                accountListId={accountListId}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.type(getByRole('textbox', { name: 'Subject' }), 'Do Something');

    const selectContact = async (name: string) => {
      userEvent.click(await findByRole('combobox', { name: 'Contacts' }));
      userEvent.click(getByRole('option', { name }));
    };

    await selectContact('Contact 1');
    await selectContact('Contact 2');
    await selectContact('Contact 3');
    userEvent.click(getByText('Save'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(dispatch).toHaveBeenCalledTimes(3);
  });

  it('persisted', async () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText, queryByLabelText, getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<UpdateTaskMutation> addTypename={false}>
              <TaskModalLogForm
                accountListId={accountListId}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>,
    );
    expect(getByRole('textbox', { name: /^Choose date/ })).toBeInTheDocument();
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
    expect(queryByLabelText('Comment')).not.toBeInTheDocument();
    expect(queryByLabelText('Tags')).not.toBeInTheDocument();
    expect(queryByLabelText('Assignee')).not.toBeInTheDocument();
    expect(queryByLabelText('Next Action')).not.toBeInTheDocument();
    userEvent.click(getByLabelText('Show More'));
    expect(getByLabelText('Comment')).toBeInTheDocument();
    userEvent.type(getByLabelText('Comment'), 'test comment');
    expect(getByLabelText('Tags')).toBeInTheDocument();
    expect(getByLabelText('Assignee')).toBeInTheDocument();
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  }, 25000);

  it('should load and show data for task', async () => {
    const onClose = jest.fn();
    const { getByRole, getByLabelText, findByRole, queryByTestId } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <MockedProvider
            mocks={[
              getDataForTaskModalMock(accountListId),
              updateTaskMutationMock(),
            ]}
            addTypename={false}
          >
            <TaskModalLogForm accountListId={accountListId} onClose={onClose} />
          </MockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );
    userEvent.click(getByLabelText('Show More'));
    const tagsElement = getByLabelText('Tags');
    userEvent.click(tagsElement);

    await waitFor(() =>
      expect(queryByTestId('loading')).not.toBeInTheDocument(),
    );
    expect(getByRole('option', { name: 'tag-2' })).toBeInTheDocument();
    userEvent.click(getByRole('option', { name: 'tag-1' }));

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    expect(
      getByRole('option', { name: 'Robert Anderson' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    expect(getByRole('option', { name: 'Smith, John' })).toBeInTheDocument();
    userEvent.click(
      getByRole('option', {
        name: 'Anderson, Robert',
      }),
    );

    const contactsElement = await findByRole('combobox', { name: 'Contacts' });
    userEvent.click(contactsElement);
    userEvent.type(contactsElement, 'Smith');
    userEvent.click(
      getByRole('option', {
        name: 'Smith, John',
      }),
    );
  }, 25000);

  it('opens the next action modal', async () => {
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const { findByText, queryByText, getByText, getByRole, getByLabelText } =
      render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider<CreateTasksMutation> onCall={mutationSpy}>
                <TaskModalLogForm
                  accountListId={accountListId}
                  onClose={onClose}
                />
              </GqlMockedProvider>
            </TestRouter>
          </SnackbarProvider>
        </LocalizationProvider>,
      );

    userEvent.click(getByLabelText('Show More'));
    expect(queryByText('Next Action')).not.toBeInTheDocument();
    userEvent.click(getByLabelText('Action'));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'Call',
      ),
    );
    expect(getByLabelText('Next Action')).toBeInTheDocument();

    userEvent.click(getByLabelText('Next Action'));
    userEvent.click(
      within(
        getByRole('listbox', { hidden: true, name: 'Next Action' }),
      ).getByText('Call'),
    );
    userEvent.click(getByText('Save'));
    expect(await findByText('Field is required')).toBeInTheDocument();
    userEvent.type(getByLabelText('Subject'), accountListId);
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(openTaskModal).toHaveBeenCalled();
  }, 10000);

  it('Select appointment, enter location, enter comment to test API calls', async () => {
    const onClose = jest.fn();
    const mutationSpy = jest.fn();
    const { getByRole, getByLabelText, queryByLabelText, getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider<UpdateTaskMutation> onCall={mutationSpy}>
              <TaskModalLogForm
                accountListId={accountListId}
                onClose={onClose}
              />
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </LocalizationProvider>,
    );
    expect(getByRole('textbox', { name: /^Choose date/ })).toBeInTheDocument();
    userEvent.type(
      getByLabelText('Subject'),
      'On the Journey with the Johnson Family',
    );
    userEvent.click(getByLabelText('Action'));
    userEvent.click(
      within(getByRole('listbox', { hidden: true, name: 'Action' })).getByText(
        'Appointment',
      ),
    );
    userEvent.type(getByLabelText('Location'), 'Newcastle');
    expect(queryByLabelText('Comment')).not.toBeInTheDocument();
    userEvent.click(getByLabelText('Show More'));
    expect(getByLabelText('Comment')).toBeInTheDocument();
    userEvent.type(getByLabelText('Comment'), 'Meeting place info');
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());

    //  3 create Task
    await waitFor(() => {
      const createTaskOperation = mutationSpy.mock.calls[2][0].operation;
      expect(createTaskOperation.operationName).toEqual('CreateTasks');
      expect(createTaskOperation.variables.attributes).toMatchObject({
        activityType: 'APPOINTMENT',
        location: 'Newcastle',
        comment: 'Meeting place info',
      });
    });
  }, 25000);
});
