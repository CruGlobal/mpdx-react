import { useApolloClient } from '@apollo/client';
import {
  TasksQueryVariables,
  TasksQuery,
} from 'pages/accountLists/[accountListId]/tasks/Tasks.generated';
import {
  TaskRowFragment,
  TaskRowFragmentDoc,
} from 'src/components/Task/TaskRow/TaskRow.generated';
import {
  GetTaskIdsForMassSelectionQuery,
  GetTaskIdsForMassSelectionQueryVariables,
  GetTaskIdsForMassSelectionDocument,
} from './GetIdsForMassSelection.generated';

const isNotNull = <T>(item: T | null): item is T => item !== null;

// The Apollo cache makes it trivial to update cached tasks after they are updated. However, we
// need to update not ony the individual tasks but also the tasks list. Handling the tasks list is
// is more complicated because modifying a task could cause the task to be filtered out of the list
// or moved in the list if its date was modified. The ContactTasksTab only loads one page of tasks,
// so it can be trivially re-fetched. However, the Tasks query is paginated, so instead of
// refetching the potentially multiple pages of tasks, we load just the ids of any active task
// queries to get the list of included tasks and their sort order. Then, we match up those ids
// with tasks we have in the cache and update the Tasks cached query results with that new list.
// Limitations:
// * Only 1000 task ids can be loaded at a time, so if there are more than 1000 tasks loaded in the
//   task list, the list will be truncated down to 1000.
// * Tasks that aren't in the cache can't be loaded without loading all of the tasks. Missing tasks
//   are most likely to occur at the end of the list because the user had 100 tasks, edited one so
//   that it no longer matched the filter, so the 100th task loaded by GetTaskIdsForMassSelection
//   is now a new task that we don't have cached. As long as the missing tasks are at the end of
//   the list, this won't be disruptive to the user.
export const useUpdateTasksQueries = (): {
  update: () => void;
} => {
  const client = useApolloClient();

  const update = () => {
    // TODO: If we refactor to create a React context for the tasks filters or let the router be
    // the single source of truth for tasks filters, we could use those variables to update the
    // cache instead of searching through the active observable queries.
    Array.from(client.getObservableQueries(['Tasks']).values()).forEach(
      async (observableQuery) => {
        if (!observableQuery.hasObservers()) {
          // Ignore inactive queries
          return;
        }

        const variables =
          observableQuery.variables as unknown as TasksQueryVariables;

        // Using the same filter as the Tasks query, get the new list of tasks, but only load their ids
        const { data: taskIds } = await client.query<
          GetTaskIdsForMassSelectionQuery,
          GetTaskIdsForMassSelectionQueryVariables
        >({
          query: GetTaskIdsForMassSelectionDocument,
          variables: {
            ...variables,
            first: observableQuery.getLastResult()?.data.tasks.nodes.length,
          },
        });
        if (!taskIds) {
          return;
        }

        client.cache.updateQuery<TasksQuery, TasksQueryVariables>(
          {
            query: observableQuery.query,
            variables,
          },
          (data) => {
            if (!data) {
              return;
            }

            const nodes = taskIds.tasks.nodes
              .map(({ id }) =>
                client.cache.readFragment<TaskRowFragment>({
                  id: `Task:${id}`,
                  fragment: TaskRowFragmentDoc,
                }),
              )
              // Ignore tasks that aren't in the cache
              .filter(isNotNull);
            return {
              ...data,
              tasks: { ...data.tasks, nodes },
            };
          },
        );
      },
    );
  };
  return { update };
};
