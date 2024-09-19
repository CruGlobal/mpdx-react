import React, { useEffect, useState } from 'react';
import Close from '@mui/icons-material/Close';
import { Avatar, Box, IconButton, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { StatusEnum } from 'src/graphql/types.generated';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
import theme from '../../../../theme';
import { StarContactIconButton } from '../../StarContactIconButton/StarContactIconButton';
import { EditIcon } from '../ContactDetailsTab/StyledComponents';
import { EditPartnershipInfoModal } from '../ContactDonationsTab/PartnershipInfo/EditPartnershipInfoModal/EditPartnershipInfoModal';
import { useGetContactDetailsHeaderQuery } from './ContactDetailsHeader.generated';
import { ContactDetailsMoreAcitions } from './ContactDetailsMoreActions/ContactDetailsMoreActions';
import { ContactHeaderAddressSection } from './ContactHeaderSection/ContactHeaderAddressSection';
import { ContactHeaderEmailSection } from './ContactHeaderSection/ContactHeaderEmailSection';
import { ContactHeaderNewsletterSection } from './ContactHeaderSection/ContactHeaderNewsletterSection';
import { ContactHeaderPhoneSection } from './ContactHeaderSection/ContactHeaderPhoneSection';
import { ContactHeaderStatusSection } from './ContactHeaderSection/ContactHeaderStatusSection';

interface Props {
  accountListId: string;
  contactId: string;
  onClose: () => void;
  setContactDetailsLoaded: (value: boolean) => void;
  contactDetailsLoaded: boolean;
  contextType?: ContactContextTypesEnum;
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
  height: 50,
  width: 50,
  borderRadius: 25,
}));
const PrimaryContactName = styled(Typography)(({}) => ({
  display: 'inline',
  marginLeft: 18,
  fontWeight: 'bold',
}));
const CloseButtonIcon = styled(Close)(({}) => ({
  width: 24,
  height: 24,
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
  contextType,
}: Props) => {
  const { data } = useGetContactDetailsHeaderQuery({
    variables: { accountListId, contactId },
  });
  const loading = !data;
  const { t } = useTranslation();

  const [editPartnershipModalOpen, setEditPartnershipModalOpen] =
    useState(false);

  useEffect(() => {
    if (!loading && !contactDetailsLoaded) {
      setContactDetailsLoaded(true);
    }
    return () => setContactDetailsLoaded(false);
  }, [loading]);

  return (
    <Box sx={{ padding: 2, backgroundColor: 'transparent' }}>
      <HeaderBar>
        <ContactAvatar alt={data?.contact.name} src={data?.contact.avatar} />
        <HeaderBarContactWrap>
          {!data?.contact ? (
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
          ) : (
            <>
              <PrimaryContactName data-testid="ContactName" variant="h5">
                {data?.contact.name}
              </PrimaryContactName>
              <IconButton
                onClick={() => setEditPartnershipModalOpen(true)}
                aria-label={t('Edit Partnership Info')}
              >
                <EditIcon
                  titleAccess="Edit Partnership Info"
                  sx={{ width: '24px', height: '24px' }}
                />
              </IconButton>
            </>
          )}
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
            contextType={contextType}
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
      {data?.contact && editPartnershipModalOpen && (
        <EditPartnershipInfoModal
          contact={data?.contact}
          handleClose={() => setEditPartnershipModalOpen(false)}
        />
      )}
    </Box>
  );
};
