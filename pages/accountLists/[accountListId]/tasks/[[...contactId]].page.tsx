import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Card,
  CardContent,
  Hidden,
  styled,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { InfiniteList } from '../../../../src/components/InfiniteList/InfiniteList';
import { ContactDetails } from '../../../../src/components/Contacts/ContactDetails/ContactDetails';
import Loading from '../../../../src/components/Loading';
import { SidePanelsLayout } from '../../../../src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { TaskFilterSetInput } from '../../../../graphql/types.generated';
import { TaskRow } from '../../../../src/components/Task/TaskRow/TaskRow';
import {
  ListHeader,
  ListHeaderCheckBoxState,
} from '../../../../src/components/Shared/Header/ListHeader';
import useTaskDrawer from '../../../../src/hooks/useTaskDrawer';
import { useTasksQuery } from './Tasks.generated';

const WhiteBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const TaskHeaderButton = styled(Button)(({ theme }) => ({
  color: '#2196F3',
  fontWeight: 600,
  marginRight: theme.spacing(1),
  marginLeft: theme.spacing(1),
}));

const TaskCheckIcon = styled(CheckCircleOutlineIcon)(() => ({
  color: '#2196F3',
}));

const TaskAddIcon = styled(AddIcon)(() => ({
  color: '#2196F3',
}));

const TasksPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();
  const { openTaskDrawer } = useTaskDrawer();

  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [contactDetailsId, setContactDetailsId] = useState<string>();
  const [selectedTasks, setSelectedTasks] = useState<Array<string>>([]);

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

  const [filterPanelOpen, setFilterPanelOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeFilters, setActiveFilters] = useState<TaskFilterSetInput>({});

  const { data, loading, fetchMore } = useTasksQuery({
    variables: {
      accountListId: accountListId ?? '',
      tasksFilter: { ...activeFilters, wildcardSearch: searchTerm?.[0] },
    },
    skip: !accountListId,
  });

  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };

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

  const handleCheckOneTask = (contactId: string): void => {
    if (!selectedTasks.includes(contactId)) {
      setSelectedTasks((prevSelected) => [...prevSelected, contactId]);
    } else {
      setSelectedTasks((prevSelected) =>
        prevSelected.filter((id) => id !== contactId),
      );
    }
  };

  const handleCheckAllTasks = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setSelectedTasks(
      event.target.checked ? data?.tasks.nodes.map(({ id }) => id) ?? [] : [],
    );
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

  const hasSelectedSomeTasks =
    selectedTasks.length > 0 &&
    selectedTasks.length < (data?.tasks.nodes.length ?? 0);
  const hasSelectedAllTasks = selectedTasks.length === data?.tasks.nodes.length;

  return (
    <>
      <Head>
        <title>MPDX | {t('Tasks')}</title>
      </Head>
      {accountListId ? (
        <WhiteBackground>
          <SidePanelsLayout
            leftPanel={<>TODO: implement task filters</>}
            leftOpen={filterPanelOpen}
            leftWidth="290px"
            mainContent={
              <>
                <ListHeader
                  page="task"
                  activeFilters={Object.keys(activeFilters).length > 0}
                  filterPanelOpen={filterPanelOpen}
                  toggleFilterPanel={toggleFilterPanel}
                  onCheckAllItems={handleCheckAllTasks}
                  onSearchTermChanged={setSearchTerm}
                  totalItems={data?.tasks.totalCount}
                  headerCheckboxState={
                    hasSelectedSomeTasks
                      ? ListHeaderCheckBoxState.partial
                      : hasSelectedAllTasks
                      ? ListHeaderCheckBoxState.checked
                      : ListHeaderCheckBoxState.unchecked
                  }
                  buttonGroup={
                    <Hidden xsDown>
                      <TaskHeaderButton
                        onClick={() => openTaskDrawer({})}
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
                  data={data?.tasks.nodes}
                  totalCount={data?.tasks.totalCount}
                  style={{ height: 'calc(100vh - 160px)' }}
                  itemContent={(index, task) => (
                    <Box key={index} flexDirection="row">
                      <TaskRow
                        accountListId={accountListId}
                        task={task}
                        onContactSelected={setContactFocus}
                        onTaskCheckToggle={handleCheckOneTask}
                        isChecked={selectedTasks.includes(task.id)}
                      />
                    </Box>
                  )}
                  endReached={() =>
                    data?.tasks.pageInfo.hasNextPage &&
                    fetchMore({
                      variables: { after: data.tasks.pageInfo.endCursor },
                    })
                  }
                  EmptyPlaceholder={
                    <Card>
                      <CardContent>
                        TODO: Implement Empty Placeholder
                      </CardContent>
                    </Card>
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
};

export default TasksPage;
