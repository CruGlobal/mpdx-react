import React, { useEffect, useMemo, useRef, useState } from 'react';
import Add from '@mui/icons-material/Add';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import { Box, Button, Checkbox, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { InfiniteList } from 'src/components/InfiniteList/InfiniteList';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';
import { StarFilterButton } from 'src/components/Shared/Header/StarFilterButton/StarFilterButton';
import { TasksMassActionsDropdown } from 'src/components/Shared/MassActions/TasksMassActionsDropdown';
import { useGetTaskIdsForMassSelectionQuery } from 'src/hooks/GetIdsForMassSelection.generated';
import useTaskModal from 'src/hooks/useTaskModal';
import { TaskFilterSetInput } from '../../../../../graphql/types.generated';
import { useMassSelection } from '../../../../hooks/useMassSelection';
import { SearchBox } from '../../../common/SearchBox/SearchBox';
import { ContactTaskRow } from './ContactTaskRow/ContactTaskRow';
import { useContactTasksTabQuery } from './ContactTasksTab.generated';
import { ContactTasksTabNullState } from './NullState/ContactTasksTabNullState';

const ContactDetailsTabContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(0),
  marginTop: theme.spacing(-1.5),
}));

const ContactTasksHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: theme.spacing(0),
  padding: theme.spacing(0),
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0),
}));

const HeaderItemsWrap = styled(Box)(({}) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
}));

const TasksTitle = styled(Typography)(({ theme }) => ({
  fontSize: 32,
  color: theme.palette.text.primary,
}));

const TaskButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const AddTaskButtonIcon = styled(Add)(({ theme }) => ({
  width: 20,
  height: 20,
  fontWeight: 600,
  margin: theme.spacing(0.5),
  color: theme.palette.info.main,
}));

const LogTaskButtonIcon = styled(CheckCircleOutline)(({ theme }) => ({
  width: 20,
  height: 20,
  fontWeight: 600,
  margin: theme.spacing(0.5),
  color: theme.palette.info.main,
}));

const TaskButtonText = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 1.25,
  color: theme.palette.info.main,
  textTransform: 'uppercase',
}));

const PlaceholderActionBar = styled(Box)(({ theme }) => ({
  height: 40,
  width: 111,
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

interface ContactTasksTabProps {
  accountListId: string;
  contactId: string;
  contactDetailsLoaded: boolean;
}

export const ContactTasksTab: React.FC<ContactTasksTabProps> = ({
  accountListId,
  contactId,
  contactDetailsLoaded,
}) => {
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [starredFilter, setStarredFilter] = useState<TaskFilterSetInput>({});
  const [infiniteListRectTop, setInfiniteListRectTop] = useState(260);
  const infiniteListRef = useRef<HTMLInputElement>(null);

  const { data, loading, fetchMore } = useContactTasksTabQuery({
    variables: {
      accountListId,
      tasksFilter: {
        contactIds: [contactId],
        ...starredFilter,
        wildcardSearch: searchTerm as string,
      },
    },
  });

  const tasksFilter = useMemo(
    () => ({
      contactIds: [contactId],
      ...starredFilter,
      wildcardSearch: searchTerm as string,
    }),
    [starredFilter, searchTerm],
  );
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
  //#region Mass Actions
  const {
    ids,
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
    deselectAll,
  } = useMassSelection(data?.tasks?.totalCount ?? 0, allTaskIds);

  const { openTaskModal } = useTaskModal();

  const { t } = useTranslation();

  useEffect(() => {
    if (!infiniteListRef.current) return;
    setInfiniteListRectTop(infiniteListRef.current.getBoundingClientRect().top);
  }, [contactId, contactDetailsLoaded]);

  return (
    <ContactDetailsTabContainer>
      <ContactTasksHeaderContainer>
        <HeaderRow>
          <TasksTitle>{t('Tasks')}</TasksTitle>
          <HeaderItemsWrap>
            <TaskButton
              onClick={() =>
                openTaskModal({
                  view: 'add',
                  defaultValues: { contactIds: [contactId] },
                })
              }
            >
              <AddTaskButtonIcon />
              <TaskButtonText>{t('add task')}</TaskButtonText>
            </TaskButton>
            <TaskButton
              onClick={() =>
                openTaskModal({
                  view: 'log',
                  defaultValues: {
                    completedAt: DateTime.local().toISO(),
                    contactIds: [contactId],
                  },
                })
              }
            >
              <LogTaskButtonIcon />
              <TaskButtonText>{t('log task')}</TaskButtonText>
            </TaskButton>
            <TasksMassActionsDropdown
              buttonGroup={null}
              selectedIds={ids}
              massDeselectAll={deselectAll}
              selectedIdCount={
                selectionType === ListHeaderCheckBoxState.checked
                  ? taskCount
                  : ids.length
              }
            />
          </HeaderItemsWrap>
        </HeaderRow>
        <HeaderRow mb={2}>
          <HeaderItemsWrap>
            <Checkbox
              checked={selectionType === ListHeaderCheckBoxState.checked}
              color="secondary"
              indeterminate={selectionType === ListHeaderCheckBoxState.partial}
              onChange={toggleSelectAll}
            />
            <SearchBox
              showContactSearchIcon={false}
              onChange={setSearchTerm}
              placeholder={t('Search Tasks')}
            />
          </HeaderItemsWrap>
          <HeaderItemsWrap>
            <PlaceholderActionBar />
            <StarFilterButton
              starredFilter={starredFilter}
              toggleStarredFilter={setStarredFilter}
            />
          </HeaderItemsWrap>
        </HeaderRow>
      </ContactTasksHeaderContainer>
      <Divider />
      <Box ref={infiniteListRef}>
        <InfiniteList
          loading={loading}
          data={data?.tasks.nodes}
          EmptyPlaceholder={<ContactTasksTabNullState contactId={contactId} />}
          itemContent={(index, task) => (
            <Box
              key={index}
              flexDirection="row"
              width="100%"
              data-testid={`task-${task.id}`}
            >
              <ContactTaskRow
                key={task.id}
                accountListId={accountListId}
                task={task}
                isChecked={isRowChecked(task.id)}
                onTaskCheckToggle={toggleSelectionById}
              />
            </Box>
          )}
          endReached={() =>
            data?.tasks?.pageInfo.hasNextPage &&
            fetchMore({
              variables: { after: data.tasks?.pageInfo.endCursor },
            })
          }
          style={{
            height: `Max(calc(100vh - ${infiniteListRectTop}px), 260px)`,
          }}
          data-testid="virtuoso-item-list"
        />
      </Box>
    </ContactDetailsTabContainer>
  );
};
