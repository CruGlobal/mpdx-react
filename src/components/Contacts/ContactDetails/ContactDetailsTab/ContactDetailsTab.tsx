import React from 'react';
import { Box, Divider, IconButton, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../ContactDetailContext';
import { useContactDetailsTabQuery } from './ContactDetailsTab.generated';
import { ContactDetailsTabMailing } from './Mailing/ContactDetailsTabMailing';
import { ContactDetailsOther } from './Other/ContactDetailsOther';
import { EditContactOtherModal } from './Other/EditContactOtherModal/EditContactOtherModal';
import { ContactDetailsPartnerAccounts } from './PartnerAccounts/ContactDetailsPartnerAccounts';
import { ContactDetailsTabPeople } from './People/ContactDetailsTabPeople';
import { EditIcon } from './StyledComponents';
import { ContactTags } from './Tags/ContactTags';

const ContactDetailsTabContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(0),
}));

const ContactDetailSectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
  paddingTop: '4px',
  margin: 0,
  alignContent: 'start',
}));

const ContactDetailHeadingContainer = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const ContactDetailHeadingText = styled(Typography)(() => ({
  flexGrow: 5,
  fontWeight: 'bold',
}));

const ContactDetailLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

interface ContactDetailTabProps {
  accountListId: string;
  contactId: string;
  onContactSelected: (
    contactId: string,
    openDetails?: boolean,
    flows?: boolean,
  ) => void;
}

export const ContactDetailsTab: React.FC<ContactDetailTabProps> = ({
  accountListId,
  contactId,
  onContactSelected,
}) => {
  const { data } = useContactDetailsTabQuery({
    variables: { accountListId, contactId },
  });

  const { t } = useTranslation();

  const { editOtherModalOpen, setEditOtherModalOpen } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  return (
    <>
      <ContactDetailsTabContainer>
        {/* Tag Section */}
        <ContactDetailHeadingContainer mt={-3}>
          {!data ? (
            <ContactDetailLoadingPlaceHolder variant="rectangular" />
          ) : (
            <ContactTags
              accountListId={accountListId}
              contactId={data.contact.id}
              contactTags={data.contact.tagList}
            />
          )}
        </ContactDetailHeadingContainer>
        <Divider />
        {/* People Section */}
        <ContactDetailSectionContainer>
          {!data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
            </>
          ) : (
            <ContactDetailsTabPeople
              data={data.contact}
              accountListId={accountListId}
            />
          )}
        </ContactDetailSectionContainer>
        <Divider />
        {/* Addresses Section */}
        <ContactDetailSectionContainer>
          <ContactDetailHeadingContainer>
            <ContactDetailHeadingText variant="h6">
              {t('Addresses')}
            </ContactDetailHeadingText>
          </ContactDetailHeadingContainer>
          {!data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
            </>
          ) : (
            <ContactDetailsTabMailing
              accountListId={accountListId}
              data={data.contact}
            />
          )}
        </ContactDetailSectionContainer>
        <Divider />
        {/* Other Section */}
        <ContactDetailSectionContainer>
          <ContactDetailHeadingContainer>
            <ContactDetailHeadingText variant="h6">
              {t('Other')}
              <IconButton
                onClick={() => setEditOtherModalOpen(true)}
                aria-label={t('Edit')}
                style={{ marginLeft: 5 }}
              >
                <EditIcon titleAccess="Edit" data-testid="Edit Other" />
              </IconButton>
            </ContactDetailHeadingText>
          </ContactDetailHeadingContainer>
          {!data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
            </>
          ) : (
            <ContactDetailsOther
              contact={data.contact}
              onContactSelected={onContactSelected}
            />
          )}
        </ContactDetailSectionContainer>
        <Divider />
        {/* Partner Accounts Section */}
        <ContactDetailSectionContainer>
          <ContactDetailHeadingContainer>
            <ContactDetailHeadingText variant="h6">
              {t('Partner Accounts')}
            </ContactDetailHeadingText>
          </ContactDetailHeadingContainer>
          {!data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
            </>
          ) : (
            <ContactDetailsPartnerAccounts contact={data.contact} />
          )}
        </ContactDetailSectionContainer>
        <Divider />
      </ContactDetailsTabContainer>
      {data && (
        <EditContactOtherModal
          accountListId={accountListId}
          contact={data.contact}
          isOpen={editOtherModalOpen}
          referral={data.contact.contactReferralsToMe.nodes[0]}
          handleClose={() => setEditOtherModalOpen(false)}
        />
      )}
    </>
  );
};
