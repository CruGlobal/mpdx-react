import { Box, Button, Divider, styled, Typography } from '@material-ui/core';
import { CheckBox, Create } from '@material-ui/icons';
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

const HeaderRow = styled(Box)(({}) => ({
  display: 'flex',
  flexDirection: 'row',
}));

const TasksTitle = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0),
}));

const TaskButton = styled(Button)(({}) => ({}));

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
          <TasksTitle>Tasks</TasksTitle>
          <Spacer />
          <TaskButton>ADD TASK</TaskButton>
          <TaskButton>LOG TASK</TaskButton>
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
