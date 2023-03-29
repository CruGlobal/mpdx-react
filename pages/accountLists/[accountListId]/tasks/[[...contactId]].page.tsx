import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, Button, ButtonGroup, Hidden } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import debounce from 'lodash/debounce';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import theme from 'src/theme';
import { dispatch } from 'src/lib/analytics';
import { suggestArticles } from 'src/lib/helpScout';
import { InfiniteList } from '../../../../src/components/InfiniteList/InfiniteList';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import {
  ResultEnum,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';
import { TaskRow } from '../../../../src/components/Task/TaskRow/TaskRow';
import {
  headerHeight,
  ListHeader,
} from '../../../../src/components/Shared/Header/ListHeader';
import NullState from '../../../../src/components/Shared/Filters/NullState/NullState';
import { FilterPanel } from '../../../../src/components/Shared/Filters/FilterPanel';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import { UserOptionFragment } from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import { ContactsProvider } from '../contacts/ContactsContext';
import {
  TasksDocument,
  useTaskFiltersQuery,
  useTasksQuery,
  TaskFiltersQuery,
} from './Tasks.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/ContactsRightPanel';
import { useGetTaskIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { MassActionsTasksConfirmationModal } from 'src/components/Task/MassActions/ConfirmationModal/MassActionsTasksConfirmationModal';
import {
  useMassActionsDeleteTasksMutation,
  useMassActionsUpdateTasksMutation,
} from 'src/components/Task/MassActions/MassActionsUpdateTasks.generated';
import { MassActionsEditTasksModal } from 'src/components/Task/MassActions/EditTasks/MassActionsEditTasksModal';
import { MassActionsTasksRemoveTagsModal } from 'src/components/Task/MassActions/RemoveTags/MassActionsTasksRemoveTagsModal';
import { MassActionsTasksAddTagsModal } from 'src/components/Task/MassActions/AddTags/MassActionsTasksAddTagsModal';
import {
  TaskFilterTabsTypes,
  taskFiltersTabs,
} from '../../../../src/utils/tasks/taskFilterTabs';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';

const buttonBarHeight = theme.spacing(6);

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const TaskHeaderButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 600,
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
}));

const TaskCurrentHistoryButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  margin: theme.spacing(1),
  color: theme.palette.primary.contrastText,
}));

const TaskCheckIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const TaskAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

export const tasksSavedFilters = (
  filterData: TaskFiltersQuery | undefined,
  accountListId: string | undefined,
): UserOptionFragment[] => {
  return (
    filterData?.userOptions.filter((option) => {
      let parsedJson: Record<string, string>;
      try {
        parsedJson = JSON.parse(option.value ?? '');
      } catch (e) {
        parsedJson = {};
      }
      return (
        (option.key?.includes('saved_tasks_filter_') ||
          option.key?.includes('graphql_saved_tasks_filter_')) &&
        ((parsedJson.account_list_id === accountListId &&
          !parsedJson.accountListId) ||
          (parsedJson.accountListId === accountListId &&
            !parsedJson.account_list_id))
      );
    }) ?? []
  );
};

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId() ?? '';
  const { enqueueSnackbar } = useSnackbar();
  const { query, push, replace, isReady, pathname } = useRouter();
  const { openTaskModal } = useTaskModal();
  const { appName } = useGetAppSettings();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  useEffect(() => {
    if (isReady && contactId) {
      setContactDetailsId(contactId[0]);
      setContactDetailsOpen(true);
    }
  }, [isReady, contactId]);

  useEffect(() => {
    suggestArticles('HS_TASKS_SUGGESTIONS');
  }, []);

  //#region Filters
  const urlFilters =
    query?.filters && JSON.parse(decodeURI(query.filters as string));

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<TaskFilterSetInput>(
    urlFilters ?? {},
  );
  const [starredFilter, setStarredFilter] = useState<TaskFilterSetInput>({});

  const [taskType, setTaskType] = useState<TaskFilterTabsTypes>(
    taskFiltersTabs[0].name,
  );

  const setTaskTypeFilter = (type: TaskFilterTabsTypes): void => {
    setTaskType(type);
    const typeDetails = taskFiltersTabs.find((item) => item.name === type);

    setActiveFilters({
      ...urlFilters,
      ...typeDetails?.activeFiltersOptions,
    });
  };

  const tasksFilter = useMemo(
    () => ({
      ...activeFilters,
      ...starredFilter,
      wildcardSearch: searchTerm as string,
    }),
    [activeFilters, starredFilter, searchTerm],
  );

  const { data, loading, fetchMore } = useTasksQuery({
    variables: {
      accountListId: accountListId ?? '',
      tasksFilter,
    },
    skip: !accountListId,
  });

  useEffect(() => {
    const { filters: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(Object.keys(activeFilters).length > 0
          ? { filters: encodeURI(JSON.stringify(activeFilters)) }
          : undefined),
      },
    });
    if (!activeFilters.completed && !activeFilters.dateRange) {
      setTaskType('All');
    } else if (activeFilters.dateRange === 'overdue') {
      setTaskType('Overdue');
    } else if (activeFilters.completed) {
      setTaskType('Completed');
    } else if (activeFilters.dateRange === 'today') {
      setTaskType('Today');
    } else if (activeFilters.dateRange === 'upcoming') {
      setTaskType('Upcoming');
    } else if (activeFilters.dateRange === 'no_date') {
      setTaskType('NoDueDate');
    }
  }, [activeFilters]);

  const { data: filterData, loading: filtersLoading } = useTaskFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const isFiltered =
    Object.keys(activeFilters).length > 0 ||
    Object.values(activeFilters).some(
      (filter) => filter !== ([] as Array<string>),
    );

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const savedFilters = tasksSavedFilters(filterData, accountListId);
  //#endregion

  //#region Mass Actions

  const taskCount = data?.tasks.totalCount ?? 0;
  const { data: allTasks } = useGetTaskIdsForMassSelectionQuery({
    variables: {
      accountListId,
      first: taskCount,
      tasksFilters: tasksFilter,
    },
    skip: taskCount === 0,
  });
  const allTaskIds = useMemo(
    () => allTasks?.tasks.nodes.map((task) => task.id) ?? [],
    [allTasks],
  );

  const {
    ids,
    selectionType,
    isRowChecked,
    deselectAll,
    toggleSelectAll,
    toggleSelectionById,
  } = useMassSelection(
    data?.tasks?.totalCount ?? 0,
    allTaskIds,
    activeFilters,
    searchTerm as string,
    starredFilter,
  );
  //#endregion

  //#region User Actions
  const setContactFocus = (id?: string) => {
    const {
      accountListId: _accountListId,
      contactId: _contactId,
      ...filteredQuery
    } = query;
    push(
      id
        ? {
            pathname: `/accountLists/${accountListId}/tasks/${id}`,
            query: filteredQuery,
          }
        : {
            pathname: `/accountLists/${accountListId}/tasks/`,
            query: filteredQuery,
          },
    );
    id && setContactDetailsId(id);
    setContactDetailsOpen(!!id);
  };

  const setSearchTerm = useCallback(
    debounce((searchTerm: string) => {
      const { searchTerm: _, ...oldQuery } = query;
      if (searchTerm !== '') {
        replace({
          pathname,
          query: {
            ...oldQuery,
            accountListId,
            ...(searchTerm && { searchTerm }),
          },
        });
      } else {
        replace({
          pathname,
          query: {
            ...oldQuery,
            accountListId,
          },
        });
      }
    }, 500),
    [accountListId],
  );
  //#endregion

  //#region mass actions

  const [completeTasksModalOpen, setCompleteTasksModalOpen] = useState(false);
  const [addTagsModalOpen, setAddTagsModalOpen] = useState(false);
  const [deleteTasksModalOpen, setDeleteTasksModalOpen] = useState(false);
  const [editTasksModalOpen, setEditTasksModalOpen] = useState(false);
  const [removeTagsModalOpen, setRemoveTagsModalOpen] = useState(false);

  const [updateTasksMutation] = useMassActionsUpdateTasksMutation();
  const [deleteTasksMutation] = useMassActionsDeleteTasksMutation();

  const completeTasks = async () => {
    const completedAt = DateTime.local().toISO();
    await updateTasksMutation({
      variables: {
        accountListId: accountListId ?? '',
        attributes: ids.map((id) => ({
          id,
          completedAt,
          result: ResultEnum.Done,
        })),
      },
      refetchQueries: [
        {
          query: TasksDocument,
          variables: { accountListId },
        },
      ],
    });
    ids.forEach(() => {
      dispatch('mpdx-task-completed');
    });
    enqueueSnackbar(t('Contact(s) completed successfully'), {
      variant: 'success',
    });
    setCompleteTasksModalOpen(false);
    deselectAll();
  };

  const deleteTasks = async () => {
    await deleteTasksMutation({
      variables: {
        accountListId: accountListId ?? '',
        ids,
      },
      refetchQueries: [
        {
          query: TasksDocument,
          variables: { accountListId },
        },
      ],
    });
    enqueueSnackbar(t('Task(s) deleted successfully'), {
      variant: 'success',
    });
    setDeleteTasksModalOpen(false);
    deselectAll();
  };

  //#endregion

  //#region JSX
  return (
    <>
      <Head>
        <title>
          {appName} | {t('Tasks')}
        </title>
      </Head>
      {accountListId ? (
        <WhiteBackground>
          <SidePanelsLayout
            leftPanel={
              filterData && !filtersLoading ? (
                <FilterPanel
                  filters={filterData?.accountList.taskFilterGroups}
                  savedFilters={savedFilters}
                  selectedFilters={activeFilters}
                  onClose={toggleFilterPanel}
                  onSelectedFiltersChanged={setActiveFilters}
                />
              ) : (
                <></>
              )
            }
            leftOpen={filterPanelOpen}
            leftWidth="290px"
            mainContent={
              <>
                <ListHeader
                  page="task"
                  activeFilters={Object.keys(activeFilters).length > 0}
                  filterPanelOpen={filterPanelOpen}
                  toggleFilterPanel={toggleFilterPanel}
                  contactDetailsOpen={contactDetailsOpen}
                  onCheckAllItems={toggleSelectAll}
                  onSearchTermChanged={setSearchTerm}
                  searchTerm={searchTerm}
                  totalItems={data?.tasks?.totalCount}
                  starredFilter={starredFilter}
                  toggleStarredFilter={setStarredFilter}
                  headerCheckboxState={selectionType}
                  buttonGroup={
                    <Hidden xsDown>
                      <TaskHeaderButton
                        onClick={() => openTaskModal({})}
                        variant="text"
                        startIcon={<TaskAddIcon />}
                      >
                        <Hidden smUp>{t('Add')}</Hidden>
                        <Hidden smDown>{t('Add Task')}</Hidden>
                      </TaskHeaderButton>
                      <TaskHeaderButton
                        onClick={() => openTaskModal({ view: 'log' })}
                        variant="text"
                        startIcon={<TaskCheckIcon />}
                      >
                        <Hidden smUp>{t('Log')}</Hidden>
                        <Hidden smDown>{t('Log Task')}</Hidden>
                      </TaskHeaderButton>
                    </Hidden>
                  }
                  selectedIds={ids}
                  openCompleteTasksModal={setCompleteTasksModalOpen}
                  openDeleteTasksModal={setDeleteTasksModalOpen}
                  openEditTasksModal={setEditTasksModalOpen}
                  openTasksRemoveTagsModal={setRemoveTagsModalOpen}
                  openTasksAddTagsModal={setAddTagsModalOpen}
                />
                {completeTasksModalOpen && (
                  <MassActionsTasksConfirmationModal
                    open={completeTasksModalOpen}
                    action="complete"
                    idsCount={ids.length}
                    setOpen={setCompleteTasksModalOpen}
                    onConfirm={completeTasks}
                  />
                )}
                {addTagsModalOpen && (
                  <MassActionsTasksAddTagsModal
                    ids={ids}
                    selectedIdCount={data?.tasks.totalCount ?? 0}
                    accountListId={accountListId}
                    handleClose={() => setAddTagsModalOpen(false)}
                  />
                )}
                {deleteTasksModalOpen && (
                  <MassActionsTasksConfirmationModal
                    open={deleteTasksModalOpen}
                    action="delete"
                    idsCount={ids.length}
                    setOpen={setDeleteTasksModalOpen}
                    onConfirm={deleteTasks}
                  />
                )}
                {editTasksModalOpen && (
                  <MassActionsEditTasksModal
                    ids={ids}
                    selectedIdCount={data?.tasks.totalCount ?? 0}
                    accountListId={accountListId}
                    handleClose={() => setEditTasksModalOpen(false)}
                  />
                )}
                {removeTagsModalOpen && (
                  <MassActionsTasksRemoveTagsModal
                    ids={ids}
                    selectedIdCount={data?.tasks.totalCount ?? 0}
                    accountListId={accountListId}
                    handleClose={() => setRemoveTagsModalOpen(false)}
                  />
                )}
                <Box>
                  <TaskCurrentHistoryButtonGroup
                    variant="outlined"
                    size="small"
                    sx={{
                      // Subtract out one unit of margin for both the top and the bottom
                      height: `calc(${buttonBarHeight} - ${theme.spacing(2)})`,
                    }}
                  >
                    {taskFiltersTabs.map((i) => (
                      <Button
                        variant={taskType === i.name ? 'contained' : 'outlined'}
                        onClick={() => setTaskTypeFilter(i.name)}
                        key={`btn-${i.name}`}
                      >
                        {i.translated ? t(i.uiName) : i.uiName}
                      </Button>
                    ))}
                  </TaskCurrentHistoryButtonGroup>
                  <InfiniteList
                    data-foo="bar"
                    loading={loading}
                    data={data?.tasks?.nodes}
                    totalCount={data?.tasks?.totalCount}
                    style={{
                      height: `calc(100vh - ${navBarHeight} - ${headerHeight} - ${buttonBarHeight})`,
                    }}
                    itemContent={(index, task) => (
                      <Box key={index} flexDirection="row" width="100%">
                        <TaskRow
                          accountListId={accountListId}
                          task={task}
                          onContactSelected={setContactFocus}
                          onTaskCheckToggle={toggleSelectionById}
                          isChecked={isRowChecked(task.id)}
                          useTopMargin={index === 0}
                        />
                      </Box>
                    )}
                    groupBy={(item) => {
                      if (item.completedAt) {
                        return t('Completed');
                      } else if (!item.startAt) {
                        return t('No Due Date');
                      } else if (
                        DateTime.fromISO(item.startAt).hasSame(
                          DateTime.now(),
                          'day',
                        )
                      ) {
                        return t('Today');
                      } else if (
                        DateTime.now().startOf('day') >
                        DateTime.fromISO(item.startAt).startOf('day')
                      ) {
                        return t('Overdue');
                      } else if (
                        DateTime.now().startOf('day') <
                        DateTime.fromISO(item.startAt).startOf('day')
                      ) {
                        return t('Upcoming');
                      }
                      return t('No Due Date');
                    }}
                    endReached={() =>
                      data?.tasks?.pageInfo.hasNextPage &&
                      fetchMore({
                        variables: { after: data.tasks?.pageInfo.endCursor },
                      })
                    }
                    EmptyPlaceholder={
                      <Box width="75%" margin="auto" mt={2}>
                        <NullState
                          page="task"
                          totalCount={data?.allTasks?.totalCount || 0}
                          filtered={isFiltered}
                          changeFilters={setActiveFilters}
                        />
                      </Box>
                    }
                  />
                </Box>
              </>
            }
            rightPanel={
              contactDetailsId ? (
                <ContactsProvider
                  urlFilters={urlFilters}
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                  starredFilter={starredFilter}
                  setStarredFilter={setStarredFilter}
                  filterPanelOpen={filterPanelOpen}
                  setFilterPanelOpen={setFilterPanelOpen}
                  contactId={contactId}
                  searchTerm={searchTerm}
                >
                  <ContactsRightPanel
                    onClose={() => setContactFocus(undefined)}
                  />
                </ContactsProvider>
              ) : (
                <></>
              )
            }
            rightOpen={contactDetailsOpen}
            rightWidth="60%"
            headerHeight={`calc(${navBarHeight} + ${headerHeight})`}
          />
        </WhiteBackground>
      ) : (
        <Loading loading />
      )}
    </>
  );
  //#endregion
};

export default TasksPage;
