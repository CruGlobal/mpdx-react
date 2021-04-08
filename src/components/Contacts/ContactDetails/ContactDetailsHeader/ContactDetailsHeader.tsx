import { Avatar, Box, IconButton, styled, Typography } from '@material-ui/core';
import {
  Close,
  Email,
  LocationOn,
  MoreVert,
  Phone,
  StarOutline,
} from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../../theme';

import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import { ContactDetailsHeaderSection } from './ContactDetailsHeaderSection/ContactDetailsHeaderSection';
import { SwapIcon } from './ContactDetailsHeaderSection/SwapIcon';

interface Props {
  accountListId: string;
  contactId: string;
}

const HeaderBar = styled(Box)(({}) => ({
  display: 'flex',
  padding: 24,
}));
const HeaderBarContactWrap = styled(Box)(({}) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
}));
const HeaderBarButtonsWrap = styled(Box)(({}) => ({
  display: 'flex',
  alignItems: 'center',
}));
const ContactAvatar = styled(Avatar)(({}) => ({
  backgroundColor: theme.palette.secondary.dark,
  height: 64,
  width: 64,
  borderRadius: 32,
}));
const PrimaryContactName = styled(Typography)(({}) => ({
  display: 'inline',
  marginLeft: 18,
}));
const PrimaryText = styled(Typography)(({}) => ({
  display: 'inline',
  marginRight: 8,
}));
const ButtonWrap = styled(IconButton)(({}) => ({
  margin: 4,
  width: 32,
  height: 32,
}));
const StarButtonIcon = styled(StarOutline)(({}) => ({
  width: 20,
  height: 20,
  color: theme.palette.text.primary,
}));
const MoreButtonIcon = styled(MoreVert)(({}) => ({
  width: 16,
  height: 16,
  color: theme.palette.text.primary,
}));
const CloseButtonIcon = styled(Close)(({}) => ({
  width: 14,
  height: 14,
  color: theme.palette.text.primary,
}));

export const ContactDetailsHeader = ({
  accountListId,
  contactId,
}: Props): ReactElement => {
  const { data, loading } = useGetContactDetailsHeaderQuery({
    variables: { accountListId, contactId },
  });
  const { t } = useTranslation();

  if (loading) {
    return (
      <Box>
        <Skeleton></Skeleton>
      </Box>
    );
  }

  const { contact } = data;

  if (!contact) {
    return null;
  }

  return (
    <Box>
      <HeaderBar>
        <ContactAvatar />
        <HeaderBarContactWrap>
          <PrimaryContactName variant="h5">
            {`${contact.primaryPerson?.firstName} ${contact.primaryPerson?.lastName}`}
          </PrimaryContactName>
          <PrimaryText variant="subtitle1">{` - ${t('Primary')}`}</PrimaryText>
        </HeaderBarContactWrap>
        <HeaderBarButtonsWrap>
          <ButtonWrap>
            <StarButtonIcon />
          </ButtonWrap>
          <ButtonWrap>
            <MoreButtonIcon />
          </ButtonWrap>
          <ButtonWrap>
            <CloseButtonIcon />
          </ButtonWrap>
        </HeaderBarButtonsWrap>
      </HeaderBar>
      <Box display="flex">
        <Box flex={1}>
          {contact.primaryAddress ? (
            <ContactDetailsHeaderSection icon={<LocationOn />}>
              <p>{contact.greeting}</p>
              <p>{contact.primaryAddress.street}</p>
              <p>{contact.primaryAddress.city}</p>
            </ContactDetailsHeaderSection>
          ) : null}
          {contact.primaryPerson?.primaryPhoneNumber?.number ? (
            <ContactDetailsHeaderSection icon={<Phone />}>
              <p>{contact.primaryPerson.primaryPhoneNumber.number}</p>
            </ContactDetailsHeaderSection>
          ) : null}
          {contact.primaryPerson?.primaryEmailAddress?.email ? (
            <ContactDetailsHeaderSection icon={<Email />}>
              <p>{contact.primaryPerson.primaryEmailAddress.email}</p>
            </ContactDetailsHeaderSection>
          ) : null}
        </Box>
        <Box flex={1}>
          {contact.status ? (
            <ContactDetailsHeaderSection icon={<SwapIcon />}>
              <p>{contact.status}</p>
            </ContactDetailsHeaderSection>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};
