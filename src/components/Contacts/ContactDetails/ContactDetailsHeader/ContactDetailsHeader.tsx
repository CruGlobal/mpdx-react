import { Avatar, Box, IconButton, styled, Typography } from '@material-ui/core';
import { Close, MoreVert, StarOutline } from '@material-ui/icons';
import { Skeleton } from '@material-ui/lab';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import theme from '../../../../theme';

import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import { ContactHeaderAddressSection } from './ContactDetailsHeaderSection/ContactHeaderAddressSection';
import { ContactHeaderPhoneSection } from './ContactDetailsHeaderSection/ContactHeaderPhoneSection';
import { ContactHeaderEmailSection } from './ContactDetailsHeaderSection/ContactHeaderEmailSection';
import { ContactHeaderStatusSection } from './ContactDetailsHeaderSection/ContactHeaderStatusSection';

interface Props {
  accountListId: string;
  contactId: string;
}

const HeaderBar = styled(Box)(({}) => ({
  display: 'flex',
  paddingBottom: 24,
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
const HeaderSectionWrap = styled(Box)(({}) => ({
  display: 'flex',
}));

export const ContactDetailsHeader = ({
  accountListId,
  contactId,
}: Props): ReactElement => {
  const { data, loading } = useGetContactDetailsHeaderQuery({
    variables: { accountListId, contactId },
  });
  const { t } = useTranslation();

  const { contact } = data || {};

  return (
    <Box style={{ padding: 24 }}>
      <HeaderBar>
        <ContactAvatar />
        <HeaderBarContactWrap>
          {contact ? (
            <>
              <PrimaryContactName role="ContactName" variant="h5">
                {`${contact.primaryPerson?.firstName} ${contact.primaryPerson?.lastName}`}
              </PrimaryContactName>
              <PrimaryText variant="subtitle1">{` - ${t(
                'Primary',
              )}`}</PrimaryText>
            </>
          ) : (
            <Skeleton
              variant="text"
              style={{
                display: 'inline',
                marginLeft: 18,
                width: 240,
                fontSize: 24,
              }}
            />
          )}
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
      <HeaderSectionWrap>
        <Box flex={1}>
          <ContactHeaderAddressSection loading={loading} contact={contact} />
          <ContactHeaderPhoneSection loading={loading} contact={contact} />
          <ContactHeaderEmailSection loading={loading} contact={contact} />
        </Box>
        <Box flex={1}>
          <ContactHeaderStatusSection loading={loading} contact={contact} />
        </Box>
      </HeaderSectionWrap>
    </Box>
  );
};
