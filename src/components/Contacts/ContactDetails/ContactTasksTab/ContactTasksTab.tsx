import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  styled,
  Typography,
} from '@material-ui/core';
import { Add, CheckCircleOutline } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import { TaskFilterSetInput } from '../../../../../graphql/types.generated';
import { SearchBox } from '../../../common/SearchBox/SearchBox';
import { useMassSelection } from '../../../../../src/hooks/useMassSelection';
import { ContactTaskRow } from './ContactTaskRow/ContactTaskRow';
import { useContactTasksTabQuery } from './ContactTasksTab.generated';
import { ContactTasksTabNullState } from './NullState/ContactTasksTabNullState';
import useTaskModal from 'src/hooks/useTaskModal';
import { StarFilterButton } from 'src/components/Shared/Header/StarFilterButton/StarFilterButton';
import { ListHeaderCheckBoxState } from 'src/components/Shared/Header/ListHeader';

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
}

export const ContactTasksTab: React.FC<ContactTasksTabProps> = ({
  accountListId,
  contactId,
}) => {
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const [starredFilter, setStarredFilter] = useState<TaskFilterSetInput>({});

  const { data, loading } = useContactTasksTabQuery({
    variables: {
      accountListId,
      tasksFilter: {
        contactIds: [contactId],
        ...starredFilter,
        wildcardSearch: searchTerm as string,
      },
    },
  });

  //#region Mass Actions
  const {
    selectionType,
    isRowChecked,
    toggleSelectAll,
    toggleSelectionById,
  } = useMassSelection(data?.tasks?.totalCount ?? 0, []);

  const { openTaskModal } = useTaskModal();

  const { t } = useTranslation();

  return (
    <ContactDetailsTabContainer>
      <ContactTasksHeaderContainer>
        <HeaderRow>
          <TasksTitle>{t('Tasks')}</TasksTitle>
          <HeaderItemsWrap>
            <TaskButton
              onClick={() =>
                openTaskModal({ defaultValues: { contactIds: [contactId] } })
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
              page="task"
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
      <Box>
        {loading || !data ? (
          <>
            <ContactTaskRow
              key="0"
              accountListId={accountListId}
              task={undefined}
              isChecked={false}
              onTaskCheckToggle={toggleSelectionById}
            />
            <ContactTaskRow
              key="1"
              accountListId={accountListId}
              task={undefined}
              isChecked={false}
              onTaskCheckToggle={toggleSelectionById}
            />
            <ContactTaskRow
              key="2"
              accountListId={accountListId}
              task={undefined}
              isChecked={false}
              onTaskCheckToggle={toggleSelectionById}
            />
          </>
        ) : data.tasks.nodes.length > 0 ? (
          data.tasks.nodes.map((task) => (
            <ContactTaskRow
              key={task.id}
              accountListId={accountListId}
              task={task}
              isChecked={isRowChecked(task.id)}
              onTaskCheckToggle={toggleSelectionById}
            />
          ))
        ) : (
          <ContactTasksTabNullState contactId={contactId} />
        )}
      </Box>
    </ContactDetailsTabContainer>
  );
};
