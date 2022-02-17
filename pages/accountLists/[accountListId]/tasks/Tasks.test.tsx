import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@material-ui/core';
import { GroupItemContent } from 'react-virtuoso';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import theme from '../../../../src/theme';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import { ListHeaderCheckBoxState } from '../../../../src/components/Shared/Header/ListHeader';
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

jest.mock('../../../../src/hooks/useMassSelection');

(useMassSelection as jest.Mock).mockReturnValue({
  selectionType: ListHeaderCheckBoxState.unchecked,
  isRowChecked: jest.fn(),
  toggleSelectAll: jest.fn(),
  toggleSelectionById: jest.fn(),
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

jest.mock('react-virtuoso', () => ({
  // eslint-disable-next-line react/display-name
  GroupedVirtuoso: ({
    itemContent,
  }: {
    itemContent: GroupItemContent<undefined>;
  }) => {
    return <div>{itemContent(0, 0, undefined)}</div>;
  },
}));

it('should render list of tasks', async () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<TasksQuery>
          mocks={{
            Tasks: {
              tasks: {
                nodes: [task],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Tasks />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  await waitFor(() => expect(getByText('Test Subject')).toBeInTheDocument());
});

it('should render contact detail panel', async () => {
  const { findAllByRole, getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<TasksQuery>
          mocks={{
            Tasks: {
              tasks: {
                nodes: [task],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Tasks />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  await waitFor(() => expect(getByText('Test Subject')).toBeInTheDocument());
  const row = await getByText('Test Person');

  userEvent.click(row);

  const detailsTabList = (await findAllByRole('tablist'))[0];

  expect(detailsTabList).toBeInTheDocument();
});

it('should open add task panel', async () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<TasksQuery>
          mocks={{
            Tasks: {
              tasks: {
                nodes: [task],
                pageInfo: { endCursor: 'Mg', hasNextPage: false },
              },
            },
          }}
        >
          <Tasks />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>,
  );
  await waitFor(() => expect(getByText('Test Person')).toBeInTheDocument());
  await waitFor(() => expect(getByText('Test Subject')).toBeInTheDocument());
  await waitFor(() => userEvent.click(getByText('Add Task')));
  await waitFor(() => expect(openTaskModal).toHaveBeenCalled());
});
