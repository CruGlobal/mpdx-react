import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { VirtuosoMockContext } from 'react-virtuoso';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { PhaseEnum } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useTaskModal from '../../../../hooks/useTaskModal';
import theme from '../../../../theme';
import { TasksMassActionsDropdown } from '../../../Shared/MassActions/TasksMassActionsDropdown';
import { ContactTasksTab } from './ContactTasksTab';
import {
  ContactPhaseQuery,
  ContactTasksTabQuery,
} from './ContactTasksTab.generated';

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
    preloadTaskModal: jest.fn(),
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
const phase = PhaseEnum.Archive;
const contactPhaseMock = {
  ContactPhase: { contact: { contactPhase: phase } },
};

describe('ContactTasksTab', () => {
  it('default', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider onCall={querySpy}>
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 300, itemHeight: 100 }}
          >
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={false}
            />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('infinite-list-skeleton-loading'),
      ).not.toBeInTheDocument(),
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
        <GqlMockedProvider>
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 300, itemHeight: 100 }}
          >
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={false}
            />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(
      getAllByTestId('infinite-list-skeleton-loading')[0],
    ).toBeInTheDocument();
  });

  it('handles add task click', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          ContactPhase: ContactPhaseQuery;
        }>
          mocks={contactPhaseMock}
          onCall={querySpy}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 300, itemHeight: 100 }}
          >
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={false}
            />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('infinite-list-skeleton-loading'),
      ).not.toBeInTheDocument(),
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
      view: TaskModalEnum.Add,
      defaultValues: {
        contactIds: [contactId],
        taskPhase: phase,
      },
    });
  });

  it('handles log task click', async () => {
    const querySpy = jest.fn();
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          ContactPhase: ContactPhaseQuery;
        }>
          mocks={contactPhaseMock}
          onCall={querySpy}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 300, itemHeight: 100 }}
          >
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={false}
            />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('infinite-list-skeleton-loading'),
      ).not.toBeInTheDocument(),
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
      view: TaskModalEnum.Log,
      defaultValues: {
        completedAt: DateTime.local().toISO(),
        contactIds: [contactId],
        taskPhase: phase,
      },
    });
  });

  it('load null state', async () => {
    const { getByText, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ ContactTasksTab: ContactTasksTabQuery }>
          mocks={{
            ContactTasksTab: {
              tasks: {
                nodes: [],
                pageInfo: {
                  endCursor: 'MjU',
                  hasNextPage: false,
                },
                totalCount: 0,
              },
            },
          }}
        >
          <ContactTasksTab
            accountListId={accountListId}
            contactId={contactId}
            contactDetailsLoaded={false}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('infinite-list-skeleton-loading'),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        getByText('No tasks can be found for this contact'),
      ).toBeInTheDocument(),
    );
  });

  it('counts total tasks when all are selected', async () => {
    const { getAllByRole, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ ContactTasksTab: ContactTasksTabQuery }>
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
            contactDetailsLoaded={false}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('infinite-list-skeleton-loading'),
      ).not.toBeInTheDocument(),
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

  it('reached end of list and fetched more', async () => {
    const querySpy = jest.fn();
    const { queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          ContactTasksTabQuery: ContactTasksTabQuery;
        }>
          mocks={{
            ContactTasksTab: {
              tasks: {
                nodes: [{}, {}, {}],
                pageInfo: {
                  endCursor: 'MjU',
                  hasNextPage: true,
                },
                totalCount: 10,
              },
            },
          }}
          onCall={querySpy}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 400, itemHeight: 100 }}
          >
            <ContactTasksTab
              accountListId={accountListId}
              contactId={contactId}
              contactDetailsLoaded={false}
            />
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(
        queryByTestId('infinite-list-skeleton-loading'),
      ).not.toBeInTheDocument(),
    );

    // Wait for the fetchMore to be called
    await waitFor(() => {
      expect(querySpy).toHaveGraphqlOperation('ContactTasksTab', {
        accountListId: '123',
        after: 'MjU',
        tasksFilter: { contactIds: ['abc'], wildcardSearch: undefined },
      });
    });
  });
});
