import React from 'react';
import { Box, IconButton, Divider, styled, Typography } from '@mui/material';
import CreateIcon from '@material-ui/icons/Create';
import { Skeleton } from '@material-ui/lab';
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
import { EditContactDetailsModal } from './People/Items/EditContactDetailsModal/EditContactDetailsModal';
import { EditContactOtherModal } from './Other/EditContactOtherModal/EditContactOtherModal';
import { EditContactMailingModal } from './Mailing/EditContactMailingModal/EditContactMailingModal';

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

const ContactDetailEditIcon = styled(CreateIcon)(({ theme }) => ({
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

  const {
    editModalOpen,
    setEditModalOpen,
    editOtherModalOpen,
    setEditOtherModalOpen,
    editMailingModalOpen,
    setEditMailingModalOpen,
  } = React.useContext(ContactDetailContext) as ContactDetailsType;

  return (
    <>
      <ContactDetailsTabContainer>
        {
          // Tag Section
        }
        <ContactDetailHeadingContainer mt={-3}>
          {loading || !data ? (
            <ContactDetailLoadingPlaceHolder variant="rect" />
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
          <ContactDetailHeadingContainer>
            <ContactDetailHeadingText variant="h6">
              {loading || !data ? t('Loading') : data.contact.name}
            </ContactDetailHeadingText>
            {loading || !data ? null : (
              <IconButton
                onClick={() => setEditModalOpen(true)}
                aria-label={t('Edit Icon')}
              >
                <ContactDetailEditIcon />
              </IconButton>
            )}
          </ContactDetailHeadingContainer>
          {loading || !data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rect" />
              <ContactDetailLoadingPlaceHolder variant="rect" />
              <ContactDetailLoadingPlaceHolder variant="rect" />
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
            {loading || !data ? null : (
              <IconButton
                onClick={() => setEditMailingModalOpen(true)}
                aria-label={t('Edit Icon')}
              >
                <ContactDetailEditIcon />
              </IconButton>
            )}
          </ContactDetailHeadingContainer>
          {loading || !data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rect" />
              <ContactDetailLoadingPlaceHolder variant="rect" />
              <ContactDetailLoadingPlaceHolder variant="rect" />
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
            {loading || !data ? null : (
              <IconButton
                onClick={() => setEditOtherModalOpen(true)}
                aria-label={t('Edit Icon')}
              >
                <ContactDetailEditIcon />
              </IconButton>
            )}
          </ContactDetailHeadingContainer>
          {loading || !data ? (
            <>
              <ContactDetailLoadingPlaceHolder variant="rect" />
              <ContactDetailLoadingPlaceHolder variant="rect" />
              <ContactDetailLoadingPlaceHolder variant="rect" />
            </>
          ) : (
            <ContactDetailsOther
              contact={data.contact}
              onContactSelected={onContactSelected}
            />
          )}
        </ContactDetailSectionContainer>
        <Divider />
      </ContactDetailsTabContainer>
      {loading || !data ? null : (
        <>
          <EditContactDetailsModal
            accountListId={accountListId}
            contact={data.contact}
            isOpen={editModalOpen}
            handleClose={() => setEditModalOpen(false)}
          />
          <EditContactOtherModal
            accountListId={accountListId}
            contact={data.contact}
            isOpen={editOtherModalOpen}
            referral={data.contact.contactReferralsToMe?.nodes[0]}
            handleClose={() => setEditOtherModalOpen(false)}
          />
          <EditContactMailingModal
            accountListId={accountListId}
            contact={data.contact}
            isOpen={editMailingModalOpen}
            handleClose={() => setEditMailingModalOpen(false)}
          />
        </>
      )}
    </>
  );
};
