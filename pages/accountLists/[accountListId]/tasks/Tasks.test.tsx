import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { VirtuosoMockContext } from 'react-virtuoso';
import { dispatch } from 'src/lib/analytics';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import useTaskModal from '../../../../src/hooks/useTaskModal';
import Tasks from './[[...contactId]].page';
import { TasksQuery } from './Tasks.generated';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const task = {
  id: '1',
  subject: 'Test Subject',
  contacts: { nodes: [{ id: '2', name: 'Test Person' }] },
};

jest.mock('../../../../src/hooks/useTaskModal');

const openTaskModal = jest.fn();

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
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

const MocksProviders = (props: { children: JSX.Element }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<TasksQuery>
        mocks={{
          Tasks: {
            tasks: {
              nodes: [task],
              pageInfo: { hasNextPage: false },
            },
          },
        }}
      >
        <VirtuosoMockContext.Provider
          value={{ viewportHeight: 1000, itemHeight: 100 }}
        >
          {props.children}
        </VirtuosoMockContext.Provider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

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
  const { findAllByRole, getByText } = render(
    <MocksProviders>
      <Tasks />
    </MocksProviders>,
  );
  await waitFor(() => expect(getByText('Test Subject')).toBeInTheDocument());
  const row = getByText('Test Person');

  userEvent.click(row);

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
  await waitFor(() =>
    expect(router).toMatchInlineSnapshot(`
      Object {
        "isReady": true,
        "query": Object {
          "accountListId": "account-list-1",
        },
      }
    `),
  );
});

it('should dispatch one analytics event per task', async () => {
  const { getAllByTestId, getByRole } = render(
    <MocksProviders>
      <GqlMockedProvider<TasksQuery>
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
  userEvent.click(getByRole('button', { name: 'Yes' }));
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
