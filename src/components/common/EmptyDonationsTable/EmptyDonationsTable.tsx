import React, { useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import HandoffLink from 'src/components/HandoffLink';
import {
  DynamicAddDonation,
  preloadAddDonation,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/AddDonation/DynamicAddDonation';
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
        <HandoffLink path="/preferences/integrations">
          <Button variant="contained">{t('Connect Services')}</Button>
        </HandoffLink>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setAddDonationOpen(true)}
          onMouseEnter={preloadAddDonation}
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
        <DynamicAddDonation
          accountListId={accountListId ?? ''}
          handleClose={handleCloseAddDonation}
        />
      </Modal>
    </BoxWrapper>
  );
};
