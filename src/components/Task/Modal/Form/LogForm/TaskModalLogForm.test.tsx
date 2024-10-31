import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AssigneeOptionsQuery } from 'src/components/Contacts/ContactDetails/ContactDetailsTab/Other/EditContactOtherModal/EditContactOther.generated';
import { ActivityTypeEnum } from 'src/graphql/types.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { dispatch } from 'src/lib/analytics';
import theme from 'src/theme';
import { TaskModalEnum } from '../../TaskModal';
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
    preloadTaskModal: jest.fn(),
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
    const { getByText, getByLabelText, getByRole, findByRole } = render(
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

    userEvent.click(getByText('Save'));
    expect(getByRole('button', { name: 'Save' })).toBeDisabled();

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Initiation' }));
    userEvent.click(await findByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Text Message' }));
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

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Initiation' }));
    userEvent.click(await findByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Text Message' }));
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
    const {
      getByRole,
      getByLabelText,
      queryByLabelText,
      getByText,
      findByRole,
    } = render(
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

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Partner Care' }));

    expect(getByRole('textbox', { name: 'Subject' })).toHaveValue('');

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Digital Newsletter' }));

    expect(await findByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Send Digital Newsletter',
    );

    expect(queryByLabelText('Comment')).not.toBeInTheDocument();
    expect(queryByLabelText('Tags')).not.toBeInTheDocument();
    expect(queryByLabelText('Assignee')).not.toBeInTheDocument();
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
    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Initiation' }));
    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(getByRole('option', { name: 'Text Message' }));

    userEvent.type(getByRole('textbox', { name: 'Subject' }), 'Do something');

    userEvent.click(getByRole('checkbox', { name: 'Show More' }));

    userEvent.click(getByRole('combobox', { name: 'Contacts' }));
    userEvent.click(await findByRole('option', { name: 'Contact 2' }));

    userEvent.click(getByRole('combobox', { name: 'Assignee' }));
    userEvent.click(await findByRole('option', { name: 'User 2' }));

    userEvent.click(getByRole('combobox', { name: 'Tags' }));
    userEvent.click(await findByRole('option', { name: 'tag-2' }));

    userEvent.type(getByRole('textbox', { name: 'Comment' }), 'test comment');

    await waitFor(() =>
      expect(getByRole('button', { name: 'Save' })).not.toBeDisabled(),
    );
    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy.mock.lastCall[0].operation).toMatchObject({
        operationName: 'CreateTasks',
        variables: {
          accountListId,
          attributes: {
            activityType: 'INITIATION_TEXT_MESSAGE',
            subject: 'Text Message To InitiateDo something',
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

    const { findByRole, getByRole } = render(
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
            <TaskModalLogForm accountListId={accountListId} onClose={onClose} />
          </GqlMockedProvider>
        </SnackbarProvider>
      </LocalizationProvider>,
    );

    userEvent.click(await findByRole('checkbox', { name: 'Show More' }));
    await waitFor(() =>
      expect(getByRole('combobox', { name: 'Assignee' })).toHaveValue('User 1'),
    );
  });

  it('only shows next action after type, action and result are selected', async () => {
    const { getByRole, findByRole, queryByRole } = render(
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

    expect(
      queryByRole('combobox', { name: 'Next Action' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Initiation' }));
    expect(
      queryByRole('combobox', { name: 'Next Action' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(
      await findByRole('option', { name: 'Special Gift Appeal' }),
    );
    expect(
      queryByRole('combobox', { name: 'Next Action' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(
      await findByRole('option', { name: 'Appointment Scheduled' }),
    );

    expect(getByRole('combobox', { name: 'Next Action' })).toBeInTheDocument();
  });

  it('hides next action for results with no suggested next actions', async () => {
    const { getByRole, findByRole, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <TaskModalLogForm
                accountListId={accountListId}
                onClose={jest.fn()}
              />
            </GqlMockedProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Initiation' }));

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'In Person' }));

    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'Not Interested' }));

    expect(
      queryByRole('combobox', { name: 'Next Action' }),
    ).not.toBeInTheDocument();
  });

  it('opens the next action modal', async () => {
    const mutationSpy = jest.fn();
    const onClose = jest.fn();
    const { findByRole, queryByRole, getByText, getByRole, getByLabelText } =
      render(
        <ThemeProvider theme={theme}>
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
          </LocalizationProvider>
        </ThemeProvider>,
      );
    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Follow-Up' }));

    expect(getByRole('textbox', { name: 'Subject' })).toHaveValue('');

    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'Phone Call' }));

    expect(await findByRole('textbox', { name: 'Subject' })).toHaveValue(
      'Phone Call To Follow Up',
    );
    expect(getByLabelText('Subject')).toHaveValue('Phone Call To Follow Up');

    expect(
      queryByRole('combobox', { name: 'Next Action' }),
    ).not.toBeInTheDocument();

    userEvent.click(getByRole('combobox', { name: 'Result' }));
    userEvent.click(await findByRole('option', { name: 'No Response Yet' }));

    expect(getByRole('combobox', { name: 'Next Action' })).toHaveValue(
      'Phone Call',
    );
    userEvent.click(getByRole('combobox', { name: 'Next Action' }));
    userEvent.click(await findByRole('option', { name: 'Email' }));

    await waitFor(() => {
      expect(getByText('Save')).not.toBeDisabled();
    });
    userEvent.click(getByText('Save'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(openTaskModal).toHaveBeenCalledWith({
      view: TaskModalEnum.Add,
      defaultValues: {
        activityType: ActivityTypeEnum.FollowUpEmail,
        contactIds: [],
        tagList: [],
        userId: 'user-1',
      },
    });
  }, 10000);

  it('Select appointment, enter location, enter comment to test API calls', async () => {
    const onClose = jest.fn();
    const mutationSpy = jest.fn();
    const {
      getByRole,
      getByLabelText,
      queryByLabelText,
      getByText,
      findByRole,
    } = render(
      <ThemeProvider theme={theme}>
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
        </LocalizationProvider>
      </ThemeProvider>,
    );

    userEvent.click(getByRole('combobox', { name: 'Task Type' }));
    userEvent.click(await findByRole('option', { name: 'Appointment' }));
    userEvent.click(getByRole('combobox', { name: 'Action' }));
    userEvent.click(await findByRole('option', { name: 'In Person' }));

    expect(await findByRole('textbox', { name: 'Subject' })).toHaveValue(
      'In Person Appointment',
    );

    userEvent.type(getByLabelText('Location'), 'Newcastle');
    expect(queryByLabelText('Comment')).not.toBeInTheDocument();
    userEvent.click(getByLabelText('Show More'));
    expect(getByLabelText('Comment')).toBeInTheDocument();
    userEvent.type(getByLabelText('Comment'), 'Meeting place info');
    await waitFor(() => {
      userEvent.click(getByText('Save'));
    });
    await waitFor(() => expect(onClose).toHaveBeenCalled());

    await waitFor(() => {
      const createTaskOperation = mutationSpy.mock.lastCall[0].operation;
      expect(createTaskOperation.operationName).toEqual('CreateTasks');
      expect(createTaskOperation.variables.attributes).toMatchObject({
        activityType: 'APPOINTMENT_IN_PERSON',
        location: 'Newcastle',
        comment: 'Meeting place info',
      });
    });
  }, 25000);

  describe('flows status change message', () => {
    const onClose = jest.fn();

    it('does not show by default', () => {
      const { queryByText } = render(
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <SnackbarProvider>
            <GqlMockedProvider>
              <TaskModalLogForm
                accountListId={accountListId}
                onClose={onClose}
              />
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
              <TaskModalLogForm
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
      const { getByRole, findByRole, getByLabelText } = render(
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <SnackbarProvider>
              <GqlMockedProvider>
                <TaskModalLogForm
                  accountListId={accountListId}
                  onClose={jest.fn()}
                />
              </GqlMockedProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeProvider>,
      );

      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      userEvent.click(await findByRole('option', { name: 'Initiation' }));
      expect(getByRole('combobox', { name: 'Task Type' })).toHaveValue(
        'Initiation',
      );

      userEvent.click(getByRole('combobox', { name: 'Action' }));
      userEvent.click(await findByRole('option', { name: 'Phone Call' }));
      expect(getByRole('combobox', { name: 'Action' })).toHaveValue(
        'Phone Call',
      );

      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      userEvent.click(await findByRole('option', { name: 'Appointment' }));
      expect(getByRole('combobox', { name: 'Task Type' })).toHaveValue(
        'Appointment',
      );
      expect(getByRole('combobox', { name: 'Action' })).toHaveValue(
        'Phone Call',
      );
      await waitFor(() => {
        expect(getByLabelText(/Task Name/i)).toHaveValue('Phone Appointment');
      });

      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      userEvent.click(await findByRole('option', { name: 'Follow-Up' }));
      expect(getByRole('combobox', { name: 'Task Type' })).toHaveValue(
        'Follow-Up',
      );

      expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
        'Phone Call To Follow Up',
      );

      userEvent.click(getByRole('combobox', { name: 'Task Type' }));
      userEvent.click(await findByRole('option', { name: 'Follow-Up' }));

      expect(getByRole('combobox', { name: 'Action' })).toHaveValue(
        'Phone Call',
      );

      expect(getByRole('textbox', { name: 'Subject' })).toHaveValue(
        'Phone Call To Follow Up',
      );
    });
  });
});
