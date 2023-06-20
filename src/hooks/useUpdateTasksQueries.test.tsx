import { InMemoryCache } from '@apollo/client';
import { render, waitFor } from '@testing-library/react';
import {
  TasksDocument,
  TasksQuery,
  TasksQueryVariables,
  useTasksQuery,
} from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import { useEffect, useRef } from 'react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { useUpdateTasksQueries } from './useUpdateTasksQueries';

const accountListId = 'account-list-1';

const Component: React.FC = () => {
  const { loading } = useTasksQuery({
    variables: {
      accountListId,
      tasksFilter: {
        completed: true,
      },
    },
  });

  const { update } = useUpdateTasksQueries();

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (!loading && firstUpdate.current) {
      firstUpdate.current = false;
      update();
    }
  }, [loading]);

  return null;
};

describe('useUpdateTasksQueries', () => {
  it('updates existing Tasks queries', async () => {
    const cache = new InMemoryCache();
    render(
      <GqlMockedProvider
        cache={cache}
        mocks={{
          Tasks: {
            tasks: {
              nodes: [1, 2, 3].map((id) => ({ id: `task-${id}` })),
            },
          },
          GetTaskIdsForMassSelection: {
            tasks: {
              nodes: [1, 3, 4].map((id) => ({ id: `task-${id}` })),
            },
          },
        }}
      >
        <Component />
      </GqlMockedProvider>,
    );

    await waitFor(() =>
      expect(
        cache
          .readQuery<TasksQuery, TasksQueryVariables>({
            query: TasksDocument,
            variables: {
              accountListId,
              tasksFilter: {
                completed: true,
              },
            },
          })
          ?.tasks.nodes.map((task) => task.id),
      ).toEqual(['task-1', 'task-3']),
    );
  });
});
