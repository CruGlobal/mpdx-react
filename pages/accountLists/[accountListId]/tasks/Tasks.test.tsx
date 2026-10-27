import React, { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VirtuosoMockContext } from 'react-virtuoso';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { GetTaskIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { dispatch } from 'src/lib/analytics';
import theme from 'src/theme';
import { TasksQuery } from './Tasks.generated';
import Tasks from './[[...contactId]].page';

const accountListId = 'account-list-1';

const task = {
  id: '1',
  subject: 'Test Subject',
  contacts: { nodes: [{ id: '2', name: 'Test Person' }] },
};

jest.mock('src/hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

jest.mock('src/lib/analytics');

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

interface MocksProvidersProps {
  routerHasContactId?: boolean;
  savedFiltersOpen?: boolean;
  onCall?: jest.Mock;
  children: ReactNode;
}

const MocksProviders: React.FC<MocksProvidersProps> = ({
  routerHasContactId = false,
  savedFiltersOpen = false,
  onCall,
  children,
}) => {
  const router = {
    pathname: '/accountLists/[accountListId]/tasks/[[...contactId]]',
    query: {
      accountListId,
      contactId: routerHasContactId
        ? ['00000000-0000-0000-0000-000000000000']
        : undefined,
    },
    isReady: true,
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{
          Tasks: TasksQuery;
          GetTaskIdsForMassSelection: GetTaskIdsForMassSelectionQuery;
          UserOption: UserOptionQuery;
        }>
          mocks={{
            Tasks: {
              tasks: {
                nodes: [task],
                pageInfo: { hasNextPage: false },
                totalCount: 20,
              },
            },
            GetTaskIdsForMassSelection: {
              tasks: { nodes: [{ id: task.id }] },
            },
            ...(savedFiltersOpen && {
              UserOption: {
                userOption: { key: 'tasks_filters_collapse', value: 'true' },
              },
            }),
          }}
          onCall={onCall}
        >
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 1000, itemHeight: 100 }}
          >
            {children}
          </VirtuosoMockContext.Provider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('tasks page', () => {
  describe('filter panel', () => {
    it('opens from the saved preference on larger screens', async () => {
      const { getByTestId } = render(
        <MocksProviders savedFiltersOpen>
          <Tasks />
        </MocksProviders>,
      );

      await waitFor(() =>
        expect(getByTestId('SidePanelsLayoutLeftPanel')).toHaveStyle(
          'transform: none',
        ),
      );
    });

    it('starts closed on small screens and closes from the backdrop without saving', async () => {
      matchMediaMock({ width: '390px' });
      const mutationSpy = jest.fn();
      const { findByRole, getByTestId, getByText } = render(
        <MocksProviders savedFiltersOpen onCall={mutationSpy}>
          <Tasks />
        </MocksProviders>,
      );

      await waitFor(() =>
        expect(getByText('Test Subject')).toBeInTheDocument(),
      );
      await waitFor(() =>
        expect(mutationSpy).toHaveGraphqlOperation('UserOption', {
          key: 'tasks_filters_collapse',
        }),
      );
      const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');
      expect(leftPanel).toHaveStyle('transform: translate(-100%)');

      userEvent.click(await findByRole('img', { name: 'Toggle Filter Panel' }));
      expect(leftPanel).toHaveStyle('transform: none');

      userEvent.click(getByTestId('SidePanelsLayoutBackdrop'));
      expect(leftPanel).toHaveStyle('transform: translate(-100%)');
      // The mock link reports operations after a tick, so let any save arrive first
      await act(() => new Promise((resolve) => setTimeout(resolve)));
      expect(mutationSpy).not.toHaveGraphqlOperation('UpdateUserOption');
    });
  });

  describe('add and log buttons', () => {
    it('collapse into a menu on phones while tasks are selected', async () => {
      matchMediaMock({ width: '390px' });
      const { findByRole, findByTestId, getByRole, queryByRole } = render(
        <MocksProviders>
          <Tasks />
        </MocksProviders>,
      );

      expect(
        await findByRole('button', { name: /Log Task/ }),
      ).toBeInTheDocument();
      userEvent.click(await findByTestId('task-row'));
      expect(await findByRole('button', { name: 'Actions' })).toBeVisible();
      expect(queryByRole('button', { name: /^Log/ })).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: 'Add or Log Task' }));
      userEvent.click(getByRole('menuitem', { name: 'Log Task' }));
      expect(openTaskModal).toHaveBeenCalledWith({ view: TaskModalEnum.Log });

      userEvent.click(getByRole('button', { name: 'Add or Log Task' }));
      userEvent.click(getByRole('menuitem', { name: 'Add Task' }));
      expect(openTaskModal).toHaveBeenCalledWith({ view: TaskModalEnum.Add });
    });

    it('stay as separate buttons on larger screens while tasks are selected', async () => {
      const { findByRole, findByTestId, getByRole, queryByRole } = render(
        <MocksProviders>
          <Tasks />
        </MocksProviders>,
      );

      userEvent.click(await findByTestId('task-row'));
      expect(await findByRole('button', { name: 'Actions' })).toBeVisible();
      expect(
        queryByRole('button', { name: 'Add or Log Task' }),
      ).not.toBeInTheDocument();

      userEvent.click(getByRole('button', { name: /Log Task/ }));
      expect(openTaskModal).toHaveBeenCalledWith({ view: TaskModalEnum.Log });
    });
  });

  it('should render list of tasks', async () => {
    const { getByText } = render(
      <MocksProviders>
        <Tasks />
      </MocksProviders>,
    );
    await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
    await waitFor(() => expect(getByText('Test Subject')).toBeInTheDocument());
  });

  it('should render contact detail panel', async () => {
    const { findByRole, findAllByRole } = render(
      <MocksProviders routerHasContactId>
        <Tasks />
      </MocksProviders>,
    );

    expect(await findByRole('link', { name: 'Test Person' })).toHaveAttribute(
      'href',
      `/accountLists/account-list-1/tasks/2`,
    );

    const detailsTabList = (await findAllByRole('tablist'))[0];

    expect(detailsTabList).toBeInTheDocument();
  });

  it('should open add task panel', async () => {
    const { getByText } = render(
      <MocksProviders>
        <Tasks />
      </MocksProviders>,
    );
    await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
    await waitFor(() => expect(getByText('Test Subject')).toBeInTheDocument());
    userEvent.click(getByText('Add Task'));
    await waitFor(() => expect(openTaskModal).toHaveBeenCalled());
  });

  it('should show Completed', async () => {
    const { getByText } = render(
      <MocksProviders>
        <Tasks />
      </MocksProviders>,
    );

    await waitFor(() => expect(getByText('Completed')).toBeInTheDocument());
    await waitFor(() => expect(getByText('Overdue')).toBeInTheDocument());
    await waitFor(() => expect(getByText('Today')).toBeInTheDocument());
    userEvent.click(getByText('Completed'));
    userEvent.click(getByText('Overdue'));
    userEvent.click(getByText('Today'));
  });

  it('should dispatch one analytics event per task', async () => {
    const { getAllByTestId, getByRole, findByRole } = render(
      <MocksProviders>
        <GqlMockedProvider<{
          Tasks: TasksQuery;
          GetTaskIdsForMassSelection: GetTaskIdsForMassSelectionQuery;
        }>
          mocks={{
            Tasks: {
              tasks: {
                nodes: [
                  { id: '1', subject: 'Task 1' },
                  { id: '2', subject: 'Task 2' },
                  { id: '3', subject: 'Task 3' },
                ],
                totalCount: 3,
                pageInfo: { hasNextPage: false },
              },
            },
            GetTaskIdsForMassSelection: {
              tasks: {
                nodes: [{ id: '1' }, { id: '2' }, { id: '3' }],
              },
            },
          }}
        >
          <Tasks />
        </GqlMockedProvider>
      </MocksProviders>,
    );

    await waitFor(() => expect(getAllByTestId('task-row')).toHaveLength(3));
    userEvent.click(getAllByTestId('task-row')[0]);
    userEvent.click(getAllByTestId('task-row')[1]);
    userEvent.click(getAllByTestId('task-row')[2]);
    userEvent.click(getByRole('button', { name: 'Actions' }));
    userEvent.click(getByRole('menuitem', { name: 'Complete Tasks' }));
    userEvent.click(await findByRole('button', { name: 'Yes' }));
    await waitFor(() => expect(dispatch).toHaveBeenCalledTimes(3));
  });

  it('should update URL which in turns updates the buttons classes.', async () => {
    const { getByText } = render(
      <MocksProviders>
        <Tasks />
      </MocksProviders>,
    );

    await waitFor(() => expect(getByText('Upcoming')).toBeInTheDocument());
    userEvent.click(getByText('Upcoming'));
    await waitFor(() =>
      expect(getByText('Upcoming')).toHaveClass('MuiButton-contained'),
    );

    await waitFor(() => expect(getByText('No Due Date')).toBeInTheDocument());
    userEvent.click(getByText('No Due Date'));
    await waitFor(() =>
      expect(getByText('No Due Date')).toHaveClass('MuiButton-contained'),
    );

    await waitFor(() => expect(getByText('All Tasks')).toBeInTheDocument());
    userEvent.click(getByText('All Tasks'));
    await waitFor(() =>
      expect(getByText('All Tasks')).toHaveClass('MuiButton-contained'),
    );
  });

  it('should remove task', async () => {
    const { getByText, getByTestId } = render(
      <MocksProviders>
        <Tasks />
      </MocksProviders>,
    );
    await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
    userEvent.click(getByTestId('task-checkbox-1'));
    expect(getByText('Showing 20')).toBeInTheDocument();
    userEvent.click(getByTestId('DeleteIconButton-1'));
    // This is needed for some reason
    userEvent.click(getByTestId('DeleteIconButton-1'));
    userEvent.click(getByText('Yes'));
    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(`Task deleted successfully`, {
        variant: 'success',
      });
    });
  });
});
