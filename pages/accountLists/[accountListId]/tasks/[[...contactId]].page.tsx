import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box, Button, Hidden, styled } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
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

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();
  const { openTaskModal } = useTaskModal();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();

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
        option.key?.includes('saved_tasks_filter_') &&
        JSON.parse(option.value ?? '').account_list_id === accountListId,
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
                <InfiniteList
                  loading={loading}
                  data={data?.tasks?.nodes}
                  totalCount={data?.tasks?.totalCount}
                  style={{ height: 'calc(100vh - 160px)' }}
                  itemContent={(index, task) => (
                    <Box key={index} flexDirection="row">
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
