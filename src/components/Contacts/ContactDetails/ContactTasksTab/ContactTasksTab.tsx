import { Box, Button, Divider, styled, Typography } from '@material-ui/core';
import { Add, CheckCircleOutline } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactCheckBox } from '../../ContactCheckBox/ContactCheckBox';
import { StarContactIcon } from '../../StarContactIcon/StarContactIcon';
import { ContactTaskRow } from '../ContactTaskRow/ContactTaskRow';
import { useContactTasksTabQuery } from './ContactTasksTab.generated';

const ContactDetailsTabContainer = styled(Box)(() => ({
  width: '100%',
  padding: '0 5%',
}));

const ContactTasksHeaderContainer = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'column',
}));

const HeaderRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  margin: theme.spacing(1),
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
  color: '#2196F3',
}));

const LogTaskButtonIcon = styled(CheckCircleOutline)(({ theme }) => ({
  width: 20,
  height: 20,
  fontWeight: 600,
  margin: theme.spacing(0.5),
  color: '#2196F3',
}));

const TaskButtonText = styled(Typography)(({}) => ({
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: 1.25,
  color: '#2196F3',
}));

const PlaceholderSearchBar = styled(Box)(({ theme }) => ({
  height: 40,
  width: 192,
  margin: theme.spacing(2),
  backgroundColor: '#F4F4F4',
}));

const Spacer = styled(Box)(({}) => ({ flex: 1 }));

const PlaceholderActionBar = styled(Box)(({ theme }) => ({
  height: 40,
  width: 111,
  margin: theme.spacing(2),
  backgroundColor: '#F4F4F4',
}));

const ContactTasksLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

interface ContactTasksTabProps {
  accountListId: string;
  contactId: string;
}

export const ContactTasksTab: React.FC<ContactTasksTabProps> = ({
  accountListId,
  contactId,
}) => {
  const { data, loading } = useContactTasksTabQuery({
    variables: { accountListId, contactId },
  });

  const { t } = useTranslation();

  return (
    <ContactDetailsTabContainer>
      <ContactTasksHeaderContainer>
        <HeaderRow>
          <TasksTitle>{t('Tasks')}</TasksTitle>
          <Spacer />
          <TaskButton>
            <AddTaskButtonIcon />
            <TaskButtonText>{t('add task').toLocaleUpperCase()}</TaskButtonText>
          </TaskButton>
          <TaskButton>
            <LogTaskButtonIcon />
            <TaskButtonText>{t('log task').toLocaleUpperCase()}</TaskButtonText>
          </TaskButton>
        </HeaderRow>
        <HeaderRow>
          <ContactCheckBox />
          <PlaceholderSearchBar />
          <Spacer />
          <PlaceholderActionBar />
          <StarContactIcon hasStar={false} />
        </HeaderRow>
      </ContactTasksHeaderContainer>
      <Divider />
      <Box>
        {loading || !data ? (
          <ContactTasksLoadingPlaceHolder variant="rect" />
        ) : (
          data.tasks.nodes.map((task) => (
            <ContactTaskRow key={task.id} task={task} />
          ))
        )}
      </Box>
    </ContactDetailsTabContainer>
  );
};
