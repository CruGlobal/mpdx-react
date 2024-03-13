import React from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssigneeOptionsQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { useUser } from 'src/hooks/useUser';
import { dispatch } from 'src/lib/analytics';
import { ContactOptionsQuery } from '../Inputs/ContactsAutocomplete/ContactsAutocomplete.generated';
import { TagOptionsQuery } from '../Inputs/TagsAutocomplete/TagsAutocomplete.generated';
import TaskModalLogForm from './TaskModalLogForm';

const accountListId = 'abc';

const mockEnqueue = jest.fn();
jest.mock('src/hooks/useTaskModal');

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
            <GqlMockedProvider addTypename={false} onCall={mutationSpy}>
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
            <GqlMockedProvider<{
              ContactOptions: ContactOptionsQuery;
            }>
              onCall={mutationSpy}
              mocks={{
                ContactOptions: {
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
            <GqlMockedProvider addTypename={false}>
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
    const mutationSpy = jest.fn();

    const { getByRole, findByRole } = render(
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
            <TaskModalLogForm accountListId={accountListId} onClose={onClose} />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.type(getByRole('textbox', { name: 'Subject' }), 'Do something');

    userEvent.click(getByRole('checkbox', { name: 'Show More' }));

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    userEvent.click(await findByRole('option', { name: 'Contact 2' }));

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    userEvent.click(await findByRole('option', { name: 'User 2' }));

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    userEvent.click(await findByRole('option', { name: 'tag-2' }));

    userEvent.type(getByRole('textbox', { name: 'Comment' }), 'test comment');

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
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
      }),
    );
  });

  it('defaults the assignee to the logged in user', async () => {
    const onClose = jest.fn();
    const mutationSpy = jest.fn();

    // Wait for the user to load before rendering the modal
    const TestComponent: React.FC = () => {
      const user = useUser();

      return user ? (
        <TaskModalLogForm accountListId={accountListId} onClose={onClose} />
      ) : null;
    };

    const { findByRole, getByRole } = render(
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
            <TestComponent />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.click(await findByRole('checkbox', { name: 'Show More' }));
    await waitFor(() =>
      expect(getByRole('combobox', { name: 'Assignee' })).toHaveValue('User 1'),
    );
  });

  it('changes the next action to the current action', () => {
    const { getByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <GqlMockedProvider>
            <TaskModalLogForm
              accountListId={accountListId}
              onClose={jest.fn()}
            />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.click(getByRole('checkbox', { name: 'Show More' }));
    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(getByRole('option', { name: 'Email' }));
    expect(getByRole('combobox', { name: 'Next Action' })).toHaveValue('Email');
  });

  it('opens the next action modal', async () => {
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const { findByText, queryByText, getByText, getByRole, getByLabelText } =
      render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <TestRouter router={router}>
              <GqlMockedProvider onCall={mutationSpy}>
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
    userEvent.type(getByLabelText('Subject'), 'Subject');
    await waitFor(() => expect(getByText('Save')).not.toBeDisabled());
    userEvent.click(getByText('Save'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(openTaskModal).toHaveBeenCalledWith({
      view: 'add',
      defaultValues: {
        subject: 'Subject',
        activityType: ActivityTypeEnum.Call,
        contactIds: [],
        tagList: [],
      },
    });
  }, 10000);

  it('Select appointment, enter location, enter comment to test API calls', async () => {
    const onClose = jest.fn();
    const mutationSpy = jest.fn();
    const { getByRole, getByLabelText, queryByLabelText, getByText } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <SnackbarProvider>
          <TestRouter router={router}>
            <GqlMockedProvider onCall={mutationSpy}>
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

    await waitFor(() => {
      const createTaskOperation = mutationSpy.mock.lastCall[0].operation;
      expect(createTaskOperation.operationName).toEqual('CreateTasks');
      expect(createTaskOperation.variables.attributes).toMatchObject({
        activityType: 'APPOINTMENT',
        location: 'Newcastle',
        comment: 'Meeting place info',
      });
    });
  }, 25000);
});
