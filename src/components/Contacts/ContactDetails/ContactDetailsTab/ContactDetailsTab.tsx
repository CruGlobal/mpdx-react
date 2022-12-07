import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import CreateIcon from '@mui/icons-material/Create';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../ContactDetailContext';
import { useContactDetailsTabQuery } from './ContactDetailsTab.generated';
import { ContactDetailsTabMailing } from './Mailing/ContactDetailsTabMailing';
import { ContactDetailsOther } from './Other/ContactDetailsOther';
import { ContactDetailsTabPeople } from './People/ContactDetailsTabPeople';
import { ContactTags } from './Tags/ContactTags';
import { EditContactOtherModal } from './Other/EditContactOtherModal/EditContactOtherModal';
import { ContactDetailsPartnerAccounts } from './PartnerAccounts/ContactDetailsPartnerAccounts';

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

export const ContactDetailEditIcon = styled(CreateIcon)(({ theme }) => ({
  width: '18px',
  height: '18px',
  margin: theme.spacing(0),
  color: theme.palette.cruGrayMedium.main,
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
  const { data, loading } = useContactDetailsTabQuery({
    variables: { accountListId, contactId },
  });

  const { t } = useTranslation();

  const { editOtherModalOpen, setEditOtherModalOpen } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  return (
    <>
      <ContactDetailsTabContainer>
        {
          // Tag Section
        }
        <ContactDetailHeadingContainer mt={-3}>
          {loading || !data ? (
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
        {
          // People Section
        }
        <ContactDetailSectionContainer>
          {loading || !data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
            </>
          ) : (
            <ContactDetailsTabPeople
              data={data?.contact}
              accountListId={accountListId}
            />
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
          </ContactDetailHeadingContainer>
          {loading || !data ? (
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
        {
          // other Section
        }
        <ContactDetailSectionContainer>
          <ContactDetailHeadingContainer>
            <ContactDetailHeadingText variant="h6">
              {t('Other')}
            </ContactDetailHeadingText>
          </ContactDetailHeadingContainer>
          {loading || !data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
              <ContactDetailLoadingPlaceHolder variant="rectangular" />
            </>
          ) : (
            <ContactDetailsOther
              contact={data.contact}
              onContactSelected={onContactSelected}
              handleOpen={setEditOtherModalOpen}
            />
          )}
        </ContactDetailSectionContainer>
        <Divider />
        {
          // Patner Accounts Section
        }
        <ContactDetailSectionContainer>
          <ContactDetailHeadingContainer>
            <ContactDetailHeadingText variant="h6">
              {t('Partner Accounts')}
            </ContactDetailHeadingText>
          </ContactDetailHeadingContainer>
          {loading || !data ? (
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
      {loading || !data ? null : (
        <>
          <EditContactOtherModal
            accountListId={accountListId}
            contact={data.contact}
            isOpen={editOtherModalOpen}
            referral={data.contact.contactReferralsToMe?.nodes[0]}
            handleClose={() => setEditOtherModalOpen(false)}
          />
        </>
      )}
    </>
  );
};
