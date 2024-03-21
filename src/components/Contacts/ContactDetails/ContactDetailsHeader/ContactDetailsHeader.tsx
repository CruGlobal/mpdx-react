import React, { useEffect } from 'react';
import Close from '@mui/icons-material/Close';
import { Avatar, Box, IconButton, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from 'src/graphql/types.generated';
import theme from '../../../../theme';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';
import {
  ContactDetailContext,
  ContactDetailsType,
} from '../ContactDetailContext';
import { EditContactDetailsModal } from '../ContactDetailsTab/People/Items/EditContactDetailsModal/EditContactDetailsModal';
import { EditIcon } from '../ContactDetailsTab/StyledComponents';
import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import { ContactDetailsMoreAcitions } from './ContactDetailsMoreActions/ContactDetailsMoreActions';
import { ContactHeaderAddressSection } from './ContactHeaderSection/ContactHeaderAddressSection';
import { ContactHeaderEmailSection } from './ContactHeaderSection/ContactHeaderEmailSection';
import { ContactHeaderNewsletterSection } from './ContactHeaderSection/ContactHeaderNewsletterSection';
import { ContactHeaderPartnerSection } from './ContactHeaderSection/ContactHeaderPartnerSection';
import { ContactHeaderPhoneSection } from './ContactHeaderSection/ContactHeaderPhoneSection';
import { ContactHeaderStatusSection } from './ContactHeaderSection/ContactHeaderStatusSection';

interface Props {
  accountListId: string;
  contactId: string;
  onClose: () => void;
  setContactDetailsLoaded: (value: boolean) => void;
  contactDetailsLoaded: boolean;
}

const HeaderBar = styled(Box)(({}) => ({
  display: 'flex',
  paddingBottom: theme.spacing(1),
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
  fontWeight: 'bold',
}));
const CloseButtonIcon = styled(Close)(({}) => ({
  width: 14,
  height: 14,
  color: theme.palette.text.primary,
}));
const HeaderSectionWrap = styled(Box)(({}) => ({
  display: 'flex',
}));

export const ContactDetailsHeader: React.FC<Props> = ({
  accountListId,
  contactId,
  onClose,
  setContactDetailsLoaded,
  contactDetailsLoaded,
}: Props) => {
  const { data, loading } = useGetContactDetailsHeaderQuery({
    variables: { accountListId, contactId },
  });
  const { t } = useTranslation();

  const { editModalOpen, setEditModalOpen } = React.useContext(
    ContactDetailContext,
  ) as ContactDetailsType;

  useEffect(() => {
    if (!loading && !contactDetailsLoaded) {
      setContactDetailsLoaded(true);
    }
    return () => setContactDetailsLoaded(false);
  }, [loading]);

  return (
    <Box style={{ padding: 24, backgroundColor: 'transparent' }}>
      <HeaderBar>
        <ContactAvatar alt={data?.contact.name} src={data?.contact.avatar} />
        <HeaderBarContactWrap>
          {loading ? (
            <Box data-testid="Skeleton">
              <Skeleton
                variant="text"
                style={{
                  display: 'inline',
                  marginLeft: 18,
                  width: 240,
                  fontSize: 24,
                }}
              />
            </Box>
          ) : data?.contact ? (
            <>
              <PrimaryContactName data-testid="ContactName" variant="h5">
                {data.contact.name}
              </PrimaryContactName>
              <IconButton
                onClick={() => setEditModalOpen(true)}
                aria-label={t('Edit Icon')}
              >
                <EditIcon />
              </IconButton>
            </>
          ) : null}
        </HeaderBarContactWrap>
        <HeaderBarButtonsWrap>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={data?.contact?.starred || false}
          />
          <ContactDetailsMoreAcitions
            contactId={contactId}
            status={data?.contact.status ?? StatusEnum.Unresponsive}
            onClose={onClose}
          />
          <IconButton onClick={onClose}>
            <CloseButtonIcon
              titleAccess={t('Close')}
              data-testid="ContactDetailsHeaderClose"
            />
          </IconButton>
        </HeaderBarButtonsWrap>
      </HeaderBar>
      <HeaderSectionWrap>
        <Box flex={1}>
          <ContactHeaderAddressSection
            loading={loading}
            contact={data?.contact}
          />
          <ContactHeaderPhoneSection
            loading={loading}
            contact={data?.contact}
          />
          <ContactHeaderEmailSection
            loading={loading}
            contact={data?.contact}
          />
        </Box>
        <Box flex={1}>
          <ContactHeaderPartnerSection
            loading={loading}
            contact={data?.contact}
          />
          <ContactHeaderStatusSection
            loading={loading}
            contact={data?.contact}
          />
          <ContactHeaderNewsletterSection
            loading={loading}
            contact={data?.contact}
          />
        </Box>
      </HeaderSectionWrap>
      {loading || !data ? null : (
        <EditContactDetailsModal
          accountListId={accountListId}
          contact={data?.contact}
          isOpen={editModalOpen}
          handleClose={() => setEditModalOpen(false)}
        />
      )}
    </Box>
  );
};
