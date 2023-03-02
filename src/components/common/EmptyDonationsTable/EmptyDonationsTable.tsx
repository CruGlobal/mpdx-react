import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { AddDonation } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/AddDonation/AddDonation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import Modal from '../Modal/Modal';

interface Props {
  title: string;
}

const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.cruGrayLight.main,
  height: 300,
  minWidth: 700,
  maxWidth: '97%',
  margin: 'auto',
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
}));

const StyledLocalAtmIcon = styled(LocalAtmIcon)(({ theme }) => ({
  color: theme.palette.cruGrayDark.main,
}));

export const EmptyDonationsTable: React.FC<Props> = ({ title }) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  const connectServices = () => {
    //TODO: Open screen to connect services
  };

  const [addDonationOpen, setAddDonationOpen] = useState(false);
  const handleCloseAddDonation = () => setAddDonationOpen(false);

  return (
    <BoxWrapper boxShadow={3}>
      <StyledLocalAtmIcon fontSize="large" />
      <Typography variant="h5">{t(title)}</Typography>
      <Typography>
        {t(
          'You can setup an organization account to import historic donations or add a new donation.',
        )}
      </Typography>
      <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={connectServices}>
          Connect Services
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddDonationOpen(true)}
        >
          {t('Add New Donation')}
        </Button>
      </Box>
      <Modal
        isOpen={addDonationOpen}
        handleClose={handleCloseAddDonation}
        title={t('Add Donation')}
        fullWidth
        size="sm"
      >
        <AddDonation
          accountListId={accountListId ?? ''}
          handleClose={handleCloseAddDonation}
        />
      </Modal>
    </BoxWrapper>
  );
};
