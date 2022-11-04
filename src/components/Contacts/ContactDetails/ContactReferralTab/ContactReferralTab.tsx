import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Add from '@mui/icons-material/Add';
import { useContactReferralTabQuery } from './ContactReferralTab.generated';
import Modal from 'src/components/common/Modal/Modal';
import { CreateMultipleContacts } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateMultipleContacts/CreateMultipleContacts';

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
  const { data, loading } = useContactReferralTabQuery({
    variables: {
      accountListId: accountListId,
      contactId: contactId,
    },
  });

  const { t } = useTranslation();
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
      {loading ? (
        <>
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
          <ContactReferralLoadingPlaceHolder />
        </>
      ) : (
        <>
          <Box width="100%" mb={2} justifyContent="end" display="flex">
            <AddButton onClick={handleModalOpen}>
              <Add />
              Add Referral
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
                            {DateTime.fromISO(createdAt).toLocaleString()}
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
            {
              <CreateMultipleContacts
                accountListId={accountListId ?? ''}
                handleClose={handleModalClose}
                referrals
                contactId={contactId}
              />
            }
          </Modal>
        </>
      )}
    </ContactReferralContainer>
  );
};
