import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import useTaskModal from '../../../../hooks/useTaskModal';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from '../../../../theme';
import { ContactTasksTab } from './ContactTasksTab';
import { ContactTasksTabQuery } from './ContactTasksTab.generated';
import { TasksMassActionsDropdown } from '../../../Shared/MassActions/TasksMassActionsDropdown';

jest.mock('../../../../hooks/useTaskModal');
jest.mock('../../../../hooks/useAccountListId');

jest.mock('../../../Shared/MassActions/TasksMassActionsDropdown', () => ({
  TasksMassActionsDropdown: jest.fn(
    jest.requireActual('../../../Shared/MassActions/TasksMassActionsDropdown')
      .TasksMassActionsDropdown,
  ),
}));

const openTaskModal = jest.fn();
const push = jest.fn();
const router = {
  query: { accountListId: '123' },
  isReady: true,
  push,
};
beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
  });
  (useAccountListId as jest.Mock).mockReturnValue(router);
});

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

const accountListId = '123';
const contactId = 'abc';

describe('ContactTasksTab', () => {
  it('default', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery> onCall={querySpy}>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    const { operation, response } = querySpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.tasksFilter.contactIds).toEqual([contactId]);
    await waitFor(() =>
      expect(
        getByText(response.data.tasks.nodes[0].subject),
      ).toBeInTheDocument(),
    );
  });

  it('loading', async () => {
    const { getAllByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery>>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(getAllByTestId('loadingRow')[0]).toBeInTheDocument();
  });

  it('handles add task click', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery> onCall={querySpy}>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    const { operation, response } = querySpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.tasksFilter.contactIds).toEqual([contactId]);
    await waitFor(() =>
      expect(
        getByText(response.data.tasks.nodes[0].subject),
      ).toBeInTheDocument(),
    );

    userEvent.click(getByText('add task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      defaultValues: {
        contactIds: [contactId],
      },
    });
  });

  it('handles log task click', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery> onCall={querySpy}>
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    const { operation, response } = querySpy.mock.calls[0][0];
    expect(operation.variables.accountListId).toEqual(accountListId);
    expect(operation.variables.tasksFilter.contactIds).toEqual([contactId]);
    await waitFor(() =>
      expect(
        getByText(response.data.tasks.nodes[0].subject),
      ).toBeInTheDocument(),
    );
    userEvent.click(getByText('log task'));
    expect(openTaskModal).toHaveBeenCalledWith({
      view: 'log',
      defaultValues: {
        completedAt: DateTime.local().toISO(),
        contactIds: [contactId],
      },
    });
  });

  it('load null state', async () => {
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery>
          mocks={{
            ContactTasksTab: {
              tasks: {
                nodes: [],
              },
            },
          }}
        >
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );
    expect(
      getByText('No tasks can be found for this contact'),
    ).toBeInTheDocument();
  });

  it('counts total tasks when all are selected', async () => {
    const { getAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<ContactTasksTabQuery>
          mocks={{
            ContactTasksTab: {
              tasks: {
                nodes: [],
                totalCount: 100,
              },
            },
          }}
        >
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(queryByTestId('loadingRow')).not.toBeInTheDocument(),
    );

    userEvent.click(getAllByRole('checkbox')[0]);

    expect(
      (
        TasksMassActionsDropdown as jest.MockedFn<
          typeof TasksMassActionsDropdown
        >
      ).mock.lastCall?.[0].selectedIdCount,
    ).toBe(100);
  });
});
