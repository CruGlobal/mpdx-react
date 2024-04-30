import React, { useState } from 'react';
import Add from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  DynamicCreateMultipleContacts,
  preloadCreateMultipleContacts,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/DynamicCreateMultipleContacts';
import Modal from 'src/components/common/Modal/Modal';
import { useFetchAllPages } from 'src/hooks/useFetchAllPages';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { useContactReferralTabQuery } from './ContactReferralTab.generated';

const ContactReferralContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0),
  marginTop: theme.spacing(-1),
}));

const ContactReferralLoadingPlaceHolder = styled(Skeleton)(({ theme }) => ({
  width: '100%',
  height: '24px',
  margin: theme.spacing(2, 0),
}));

const ReferralName = styled(Typography)(() => ({
  width: 'fit-content',
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const AddButton = styled(Button)(({ theme }) => ({
  fontWeight: 600,
  margin: theme.spacing(0.5),
  color: theme.palette.info.main,
}));

interface ContactReferralTabProps {
  accountListId: string;
  contactId: string;
  onContactSelected: (
    contactId: string,
    openDetails?: boolean,
    flows?: boolean,
  ) => void;
}

export const ContactReferralTab: React.FC<ContactReferralTabProps> = ({
  accountListId,
  contactId,
  onContactSelected,
}) => {
  const { data, error, fetchMore } = useContactReferralTabQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });
  useFetchAllPages({
    fetchMore,
    error,
    pageInfo: data?.contact.contactReferralsByMe.pageInfo,
  });

  const { t } = useTranslation();
  const locale = useLocale();
  const [modalContactReferralOpen, setModalContactReferralOpen] =
    useState(false);

  const handleModalOpen = () => {
    setModalContactReferralOpen(true);
  };

  const handleModalClose = () => {
    setModalContactReferralOpen(false);
  };

  return (
    <ContactReferralContainer>
      {!data ? (
        <>
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
        </>
      ) : (
        <>
          <Box width="100%" mb={2} justifyContent="end" display="flex">
            <AddButton
              onClick={handleModalOpen}
              onMouseEnter={preloadCreateMultipleContacts}
            >
              <Add />
              {t('Add Referrals')}
            </AddButton>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('Name')}</TableCell>
                  <TableCell>{t('Referral Date')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.contact &&
                data.contact.contactReferralsByMe.nodes.length > 0 ? (
                  data?.contact.contactReferralsByMe.nodes.map(
                    ({ id, referredTo, createdAt }) => (
                      <TableRow key={id}>
                        <TableCell>
                          <ReferralName
                            onClick={() => onContactSelected(referredTo.id)}
                          >
                            {referredTo.name}
                          </ReferralName>
                        </TableCell>
                        <TableCell>
                          <Typography>
                            {dateFormat(DateTime.fromISO(createdAt), locale)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                ) : (
                  <TableRow key="no_data">
                    <TableCell>{t('No Referrals')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Modal
            isOpen={modalContactReferralOpen}
            handleClose={handleModalClose}
            title={t('Add Referrals')}
            aria-labelledby={t('Create Referral Dialog')}
            fullWidth
            size={'xl'} // TODO: Expand logic as more menu modals are added
          >
            <DynamicCreateMultipleContacts
              accountListId={accountListId ?? ''}
              handleClose={handleModalClose}
              referredById={contactId}
            />
          </Modal>
        </>
      )}
    </ContactReferralContainer>
  );
};
