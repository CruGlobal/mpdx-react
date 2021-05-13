import { Box, Button, Divider, styled, Typography } from '@material-ui/core';
import { Add, CheckCircleOutline } from '@material-ui/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StarredItemIcon } from '../../../common/StarredItemIcon/StarredItemIcon';
import { SearchBox } from '../../../common/SearchBox/SearchBox';
import { ContactCheckBox } from '../../ContactCheckBox/ContactCheckBox';
import { ContactTaskRow } from './ContactTaskRow/ContactTaskRow';
import { useContactTasksTabQuery } from './ContactTasksTab.generated';

const ContactDetailsTabContainer = styled(Box)(() => ({
  width: '100%',
  padding: '0 5%',
}));

const ContactTasksHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  margin: theme.spacing(1),
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: theme.spacing(1),
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
}));

const PlaceholderActionBar = styled(Box)(({ theme }) => ({
  height: 40,
  width: 111,
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

const StarIconWrap = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
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

  const { data, loading } = useContactTasksTabQuery({
    variables: { accountListId, contactId, searchTerm },
  });

  const { t } = useTranslation();

  return (
    <ContactDetailsTabContainer>
      <ContactTasksHeaderContainer>
        <HeaderRow>
          <TasksTitle>{t('Tasks')}</TasksTitle>
          <HeaderItemsWrap>
            <TaskButton>
              <AddTaskButtonIcon />
              <TaskButtonText>
                {t('add task').toLocaleUpperCase()}
              </TaskButtonText>
            </TaskButton>
            <TaskButton>
              <LogTaskButtonIcon />
              <TaskButtonText>
                {t('log task').toLocaleUpperCase()}
              </TaskButtonText>
            </TaskButton>
          </HeaderItemsWrap>
        </HeaderRow>
        <HeaderRow>
          <HeaderItemsWrap>
            <ContactCheckBox />
            <SearchBox
              onChange={setSearchTerm}
              placeholder={t('Search Tasks')}
            />
          </HeaderItemsWrap>
          <HeaderItemsWrap>
            <PlaceholderActionBar />
            <StarIconWrap>
              <StarredItemIcon isStarred={false} />
            </StarIconWrap>
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
            />
            <ContactTaskRow
              key="1"
              accountListId={accountListId}
              task={undefined}
            />
            <ContactTaskRow
              key="2"
              accountListId={accountListId}
              task={undefined}
            />
          </>
        ) : (
          data.tasks.nodes.map((task) => (
            <ContactTaskRow
              key={task.id}
              accountListId={accountListId}
              task={task}
            />
          ))
        )}
      </Box>
    </ContactDetailsTabContainer>
  );
};
