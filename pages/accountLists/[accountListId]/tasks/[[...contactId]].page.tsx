import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Hidden,
  MenuItem,
  styled,
  TextField,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { InfiniteList } from '../../../../src/components/InfiniteList/InfiniteList';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { TaskFilterSetInput } from '../../../../graphql/types.generated';
import { TaskRow } from '../../../../src/components/Task/TaskRow/TaskRow';
import { ListHeader } from '../../../../src/components/Shared/Header/ListHeader';
import NullState from '../../../../src/components/Shared/Filters/NullState/NullState';
import { FilterPanel } from '../../../../src/components/Shared/Filters/FilterPanel';
import { useMassSelection } from '../../../../src/hooks/useMassSelection';
import { UserOptionFragment } from '../../../../src/components/Shared/Filters/FilterPanel.generated';
import { useTaskFiltersQuery, useTasksQuery } from './Tasks.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import theme from 'src/theme';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const TaskHeaderButton = styled(Button)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 600,
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
}));

const TaskCheckIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

const TaskAddIcon = styled(AddIcon)(({ theme }) => ({
  color: theme.palette.info.main,
}));

enum TaskDueDates {
  All = 'all',
  Today = 'today',
  Overdue = 'overdue',
  Upcoming = 'upcoming',
  None = 'no due date',
}

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();
  const { openTaskModal } = useTaskModal();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();
  const [showCurrentTasks, setShowCurrentTasks] = useState<boolean>(true);

  const { contactId, searchTerm } = query;

  if (contactId !== undefined && !Array.isArray(contactId)) {
    throw new Error('contactId should be an array or undefined');
  }

  if (searchTerm !== undefined && !Array.isArray(searchTerm)) {
    throw new Error('searchTerm should be an array or undefined');
  }

  useEffect(() => {
    if (isReady && contactId) {
      setContactDetailsId(contactId[0]);
      setContactDetailsOpen(true);
    }
  }, [isReady, contactId]);

  //#region Filters
  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<TaskFilterSetInput>({});
  const [starredFilter, setStarredFilter] = useState<TaskFilterSetInput>({});

  const { data, loading, fetchMore } = useTasksQuery({
    variables: {
      accountListId: accountListId ?? '',
      completed: showCurrentTasks,
      tasksFilter: {
        ...activeFilters,
        ...starredFilter,
        wildcardSearch: searchTerm?.[0],
      },
    },
    skip: !accountListId,
  });

  const { data: filterData, loading: filtersLoading } = useTaskFiltersQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const isFiltered =
    Object.keys(activeFilters).length > 0 ||
    Object.values(activeFilters).some((filter) => filter !== []);

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

  const savedFilters: UserOptionFragment[] =
    filterData?.userOptions.filter(
      (option) =>
        (option.key?.includes('saved_tasks_filter_') ||
          option.key?.includes('graphql_saved_tasks_filter_')) &&
        (JSON.parse(option.value ?? '').account_list_id === accountListId ||
          JSON.parse(option.value ?? '').accountListId === accountListId),
    ) ?? [];
  //#endregion

  //#region Mass Actions
  const {
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  } = useMassSelection(data?.tasks?.totalCount ?? 0);
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

  const setSearchTerm = (searchTerm?: string) => {
    const { searchTerm: _, ...oldQuery } = query;
    replace({
      pathname,
      query: {
        ...oldQuery,
        ...(searchTerm && { searchTerm }),
      },
    });
  };
  //#endregion

  const toggleLoadedTasks = (
    event: React.MouseEvent<HTMLElement>,
    current: boolean,
  ): void => {
    setShowCurrentTasks(current);
  };

  const [showDueDates, setShowDueDates] = useState<TaskDueDates>(
    TaskDueDates.All,
  );

  const handleChangeDueDates = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setShowDueDates(
      TaskDueDates[event.target.value as keyof typeof TaskDueDates],
    );
  };

  //#region JSX
  return (
    <>
      <Head>
        <title>MPDX | {t('Tasks')}</title>
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
                  buttonGroup={
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      p={2}
                      pb={0}
                      width="100%"
                    >
                      <ToggleButtonGroup
                        exclusive
                        value={showCurrentTasks}
                        onChange={toggleLoadedTasks}
                      >
                        <ToggleButton
                          value={true}
                          disabled={showCurrentTasks}
                          style={{ textTransform: 'none' }}
                        >
                          <Typography>{t('Current')}</Typography>
                        </ToggleButton>
                        <ToggleButton
                          value={false}
                          disabled={!showCurrentTasks}
                          style={{ textTransform: 'none' }}
                        >
                          <Typography>{t('Historic')}</Typography>
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <TextField
                        value={showDueDates}
                        select
                        size="small"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => handleChangeDueDates(event)}
                        fullWidth
                        variant="outlined"
                        style={{ marginTop: theme.spacing(2) }}
                      >
                        <MenuItem value={'All'}>{t('All')}</MenuItem>
                        <MenuItem value={'Today'}>{t('Today')}</MenuItem>
                        <MenuItem value={'Overdue'}>{t('Overdue')}</MenuItem>
                        <MenuItem value={'Upcoming'}>{t('Upcoming')}</MenuItem>
                        <MenuItem value={'None'}>{t('No Due Date')}</MenuItem>
                      </TextField>
                    </Box>
                  }
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
                        {t('Add Task')}
                      </TaskHeaderButton>
                      <TaskHeaderButton
                        variant="text"
                        startIcon={<TaskCheckIcon />}
                      >
                        {t('Log Task')}
                      </TaskHeaderButton>
                    </Hidden>
                  }
                />
                {(showDueDates === TaskDueDates.All ||
                  showDueDates === TaskDueDates.Overdue) && (
                  <>
                    <Box
                      width="full"
                      height={theme.spacing(8)}
                      display="flex"
                      alignItems="center"
                      p={2}
                      borderBottom={`3px solid ${theme.palette.progressBarOrange.main}`}
                    >
                      <Typography variant="h6">{t('Overdue')}</Typography>
                    </Box>
                    <InfiniteList
                      loading={loading}
                      data={data?.tasks?.nodes}
                      totalCount={data?.tasks?.totalCount}
                      itemContent={(index, task) => (
                        <Box key={index} flexDirection="row" width="100%">
                          <TaskRow
                            accountListId={accountListId}
                            task={task}
                            onContactSelected={setContactFocus}
                            onTaskCheckToggle={toggleSelectionById}
                            isChecked={isRowChecked(task.id)}
                          />
                        </Box>
                      )}
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
                  </>
                )}
                {(showDueDates === TaskDueDates.All ||
                  showDueDates === TaskDueDates.Today) && (
                  <>
                    <Box
                      width="full"
                      height={theme.spacing(8)}
                      display="flex"
                      alignItems="center"
                      p={2}
                      borderBottom={`3px solid ${theme.palette.warning.main}`}
                    >
                      <Typography variant="h6">{t('Today')}</Typography>
                    </Box>
                    <InfiniteList
                      loading={loading}
                      data={data?.tasks?.nodes}
                      totalCount={data?.tasks?.totalCount}
                      itemContent={(index, task) => (
                        <Box key={index} flexDirection="row" width="100%">
                          <TaskRow
                            accountListId={accountListId}
                            task={task}
                            onContactSelected={setContactFocus}
                            onTaskCheckToggle={toggleSelectionById}
                            isChecked={isRowChecked(task.id)}
                          />
                        </Box>
                      )}
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
                  </>
                )}
                {(showDueDates === TaskDueDates.All ||
                  showDueDates === TaskDueDates.Upcoming) && (
                  <>
                    <Box
                      width="full"
                      height={theme.spacing(8)}
                      display="flex"
                      alignItems="center"
                      p={2}
                      borderBottom={`3px solid ${theme.palette.success.main}`}
                    >
                      <Typography variant="h6">{t('Upcoming')}</Typography>
                    </Box>
                    <InfiniteList
                      loading={loading}
                      data={data?.tasks?.nodes}
                      totalCount={data?.tasks?.totalCount}
                      itemContent={(index, task) => (
                        <Box key={index} flexDirection="row" width="100%">
                          <TaskRow
                            accountListId={accountListId}
                            task={task}
                            onContactSelected={setContactFocus}
                            onTaskCheckToggle={toggleSelectionById}
                            isChecked={isRowChecked(task.id)}
                          />
                        </Box>
                      )}
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
                  </>
                )}
                {(showDueDates === TaskDueDates.All ||
                  showDueDates === TaskDueDates.None) && (
                  <>
                    <Box
                      width="full"
                      height={theme.spacing(8)}
                      display="flex"
                      alignItems="center"
                      p={2}
                      borderBottom={`3px solid ${theme.palette.cruGrayMedium.main}`}
                    >
                      <Typography variant="h6">{t('No Due Date')}</Typography>
                    </Box>
                    <InfiniteList
                      loading={loading}
                      data={data?.tasks?.nodes}
                      totalCount={data?.tasks?.totalCount}
                      itemContent={(index, task) => (
                        <Box key={index} flexDirection="row" width="100%">
                          <TaskRow
                            accountListId={accountListId}
                            task={task}
                            onContactSelected={setContactFocus}
                            onTaskCheckToggle={toggleSelectionById}
                            isChecked={isRowChecked(task.id)}
                          />
                        </Box>
                      )}
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
                  </>
                )}
              </>
            }
            rightPanel={
              contactDetailsId ? (
                <ContactDetails
                  accountListId={accountListId}
                  contactId={contactDetailsId}
                  onClose={() => setContactFocus(undefined)}
                />
              ) : (
                <></>
              )
            }
            rightOpen={contactDetailsOpen}
            rightWidth="45%"
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
