import { Box, Button, Divider, styled, Typography } from '@material-ui/core';
import {
  Add,
  CheckBox,
  CheckCircle,
  CheckCircleOutline,
  Create,
  PlusOneOutlined,
} from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ContactCheckBox } from '../../ContactCheckBox/ContactCheckBox';
import { StarContactIcon } from '../../StarContactIcon/StarContactIcon';
//import { useContactDetailsTabQuery } from './ContactDetailsTab.generated';
//import { ContactTags } from './Tags/ContactTags';

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

const PlaceholderSearchBar = styled(Box)(({}) => ({}));

const Spacer = styled(Box)(({}) => ({ flex: 1 }));

const PlaceholderActionBar = styled(Box)(({}) => ({}));

const StarButtonWrap = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  marginRight: theme.spacing(1),
}));

interface ContactTasksTabProps {
  accountListId: string;
  contactId: string;
}

export const ContactTasksTab: React.FC<ContactTasksTabProps> = ({
  accountListId,
  contactId,
}) => {
  /*const { data, loading } = useContactDetailsTabQuery({
    variables: { accountListId, contactId },
  });*/

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
      {/*
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <ContactDetailHeadingText variant="h6">
            {loading || !data ? t('Loading') : data.contact.name}
          </ContactDetailHeadingText>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
        {loading ? (
          <>
            <ContactDetailLoadingPlaceHolder variant="rect" />
            <ContactDetailLoadingPlaceHolder variant="rect" />
            <ContactDetailLoadingPlaceHolder variant="rect" />
          </>
        ) : (
          <></>
        )}
      </ContactDetailSectionContainer>
      <Divider />
      {
        // Mailing Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <ContactDetailHeadingText variant="h6">
            {t('Mailing')}
          </ContactDetailHeadingText>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
        {loading ? (
          <>
            <ContactDetailLoadingPlaceHolder variant="rect" />
            <ContactDetailLoadingPlaceHolder variant="rect" />
            <ContactDetailLoadingPlaceHolder variant="rect" />
          </>
        ) : (
          <></>
        )}
      </ContactDetailSectionContainer>
      <Divider />
      {
        // other Section
      }
      <ContactDetailSectionContainer>
        <ContactDetailHeadingContainer>
          <ContactDetailHeadingText variant="h6">
            {t('Other')}
          </ContactDetailHeadingText>
          <ContactDetailHeadingIcon />
        </ContactDetailHeadingContainer>
        {loading ? (
          <>
            <ContactDetailLoadingPlaceHolder variant="rect" />
            <ContactDetailLoadingPlaceHolder variant="rect" />
            <ContactDetailLoadingPlaceHolder variant="rect" />
          </>
        ) : (
          <></>
        )}
      </ContactDetailSectionContainer>
      <Divider />
      <ContactDeleteButton variant="outlined" color="default">
        {t('delete contact')}
      </ContactDeleteButton>
      */}
    </ContactDetailsTabContainer>
  );
};
