import { ParsedUrlQueryInput } from 'querystring';
import Head from 'next/head';
import React, { useEffect, useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Button, ButtonGroup, Hidden } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { ContactsProvider } from 'src/components/Contacts/ContactsContext/ContactsContext';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { DynamicFilterPanel } from 'src/components/Shared/Filters/DynamicFilterPanel';
import { UserOptionFragment } from 'src/components/Shared/Filters/FilterPanel.generated';
import NullState from 'src/components/Shared/Filters/NullState/NullState';
import {
  ListHeader,
  PageEnum,
  headerHeight,
} from 'src/components/Shared/Header/ListHeader';
import { TaskModalEnum } from 'src/components/Task/Modal/TaskModal';
import { TaskRow } from 'src/components/Task/TaskRow/TaskRow';
import { useGetTaskIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useMassSelection } from 'src/hooks/useMassSelection';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';
import {
  TaskFilterTabsTypes,
  taskFiltersTabs,
} from 'src/utils/tasks/taskFilterTabs';
import {
  TaskFiltersQuery,
  useTaskFiltersQuery,
  useTasksQuery,
} from './Tasks.generated';
import { useTasksContactContext } from './useTasksContactContext';

export type ContactUrl = {
  contactUrl: string;
  filteredQuery: string | ParsedUrlQueryInput;
};

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
  const { openTaskModal, preloadTaskModal } = useTaskModal();
  const { appName } = useGetAppSettings();

  const {
    activeFilters,
    setActiveFilters,
    starredFilter,
    setStarredFilter,
    searchTerm,
    setSearchTerm,
    getContactHrefObject,
    contactId: contactDetailsId,
    setContactId: setContactFocus,
  } = useTasksContactContext();
  const contactDetailsOpen = !!contactDetailsId;
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);

  //#region Filters

  const [taskType, setTaskType] = useState<TaskFilterTabsTypes>(
    taskFiltersTabs[0].name,
  );

  const setTaskTypeFilter = (type: TaskFilterTabsTypes): void => {
    setTaskType(type);
    const typeDetails = taskFiltersTabs.find((item) => item.name === type);

    setActiveFilters({
      ...activeFilters,
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
    context: {
      doNotBatch: true,
    },
  });

  useEffect(() => {
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

  const isFiltered = Object.keys(activeFilters).length > 0;

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
      tasksFilter,
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
    deselectMultipleIds,
  } = useMassSelection(allTaskIds);
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
          <ContactsProvider
            activeFilters={{}}
            setActiveFilters={setActiveFilters}
            starredFilter={{}}
            setStarredFilter={setStarredFilter}
            filterPanelOpen={filterPanelOpen}
            setFilterPanelOpen={setFilterPanelOpen}
            contactId={contactDetailsId}
            setContactId={setContactFocus}
            getContactHrefObject={getContactHrefObject}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          >
            <SidePanelsLayout
              leftPanel={
                filterData && !filtersLoading ? (
                  <DynamicFilterPanel
                    filters={filterData?.accountList.taskFilterGroups}
                    savedFilters={savedFilters}
                    selectedFilters={activeFilters}
                    onClose={toggleFilterPanel}
                    onSelectedFiltersChanged={setActiveFilters}
                  />
                ) : undefined
              }
              leftOpen={filterPanelOpen}
              leftWidth="290px"
              mainContent={
                <>
                  <ListHeader
                    page={PageEnum.Task}
                    activeFilters={isFiltered}
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
                    massDeselectAll={deselectAll}
                    showShowingCount
                    selectedIds={ids}
                    buttonGroup={
                      <Hidden xsDown>
                        <TaskHeaderButton
                          onClick={() =>
                            openTaskModal({ view: TaskModalEnum.Add })
                          }
                          onMouseEnter={() =>
                            preloadTaskModal(TaskModalEnum.Add)
                          }
                          variant="text"
                          startIcon={<TaskAddIcon />}
                        >
                          <Hidden smUp>{t('Add')}</Hidden>
                          <Hidden smDown>{t('Add Task')}</Hidden>
                        </TaskHeaderButton>
                        <TaskHeaderButton
                          onClick={() =>
                            openTaskModal({ view: TaskModalEnum.Log })
                          }
                          onMouseEnter={() =>
                            preloadTaskModal(TaskModalEnum.Log)
                          }
                          variant="text"
                          startIcon={<TaskCheckIcon />}
                        >
                          <Hidden smUp>{t('Log')}</Hidden>
                          <Hidden smDown>{t('Log Task')}</Hidden>
                        </TaskHeaderButton>
                      </Hidden>
                    }
                  />
                  <Box>
                    <TaskCurrentHistoryButtonGroup
                      variant="outlined"
                      size="small"
                      sx={{
                        // Subtract out one unit of margin for both the top and the bottom
                        height: `calc(${buttonBarHeight} - ${theme.spacing(
                          2,
                        )})`,
                      }}
                    >
                      {taskFiltersTabs.map((i) => (
                        <Button
                          variant={
                            taskType === i.name ? 'contained' : 'outlined'
                          }
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
                      data={data?.tasks.nodes}
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
                            getContactHrefObject={getContactHrefObject}
                            removeSelectedIds={deselectMultipleIds}
                            filterPanelOpen={filterPanelOpen}
                          />
                        </Box>
                      )}
                      groupBy={(item) => {
                        if (item.completedAt) {
                          return { order: 5, label: t('Completed') };
                        } else if (!item.startAt) {
                          return { order: 1, label: t('No Due Date') };
                        } else if (
                          DateTime.fromISO(item.startAt).hasSame(
                            DateTime.now(),
                            'day',
                          )
                        ) {
                          return { order: 2, label: t('Today') };
                        } else if (
                          DateTime.now().startOf('day') >
                          DateTime.fromISO(item.startAt).startOf('day')
                        ) {
                          return { order: 1, label: t('Overdue') };
                        } else if (
                          DateTime.now().startOf('day') <
                          DateTime.fromISO(item.startAt).startOf('day')
                        ) {
                          return { order: 3, label: t('Upcoming') };
                        }
                        return { order: 4, label: t('No Due Date') };
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
                            filtered={isFiltered || !!searchTerm}
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
                  <DynamicContactsRightPanel
                    onClose={() => setContactFocus(undefined)}
                  />
                ) : undefined
              }
              rightOpen={contactDetailsOpen}
              rightWidth="60%"
              headerHeight={headerHeight}
            />
          </ContactsProvider>
        </WhiteBackground>
      ) : (
        <Loading loading />
      )}
    </>
  );
  //#endregion
};

export const getServerSideProps = loadSession;

export default TasksPage;
