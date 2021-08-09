import React, { useState } from 'react';
import { Box, Typography, styled, Button, Dialog } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import CreateDonationModal from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/CreateDonation/CreateDonationModal';

interface Props {
  accountListId: string;
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

export const EmptyDonationsTable: React.FC<Props> = ({
  accountListId,
  title,
}) => {
  const { t } = useTranslation();
  const [dialogOpen, changeDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    changeDialogOpen(true);
  };

  const handleDialogClose = () => {
    changeDialogOpen(false);
  };

  const renderDialog = () => (
    <Dialog
      open={dialogOpen}
      aria-labelledby={t('Add Donation Dialog')}
      fullWidth
      maxWidth="sm"
    >
      <CreateDonationModal
        accountListId={accountListId ?? ''}
        handleClose={handleDialogClose}
      />
    </Dialog>
  );

  const connectServices = () => {
    //TODO: Open screen to connect services
  };

  return (
    <>
      <BoxWrapper boxShadow={3}>
        <img src="bill.jpg" alt="bill" style={{ padding: 4 }}></img>
        <Typography variant="h5">{t(title)}</Typography>
        <Typography>
          {t(
            'You can setup an organization account to import historic donations or add a new donation.',
          )}
        </Typography>
        <Box style={{ padding: 4 }}>
          <Button variant="contained" onClick={connectServices}>
            {t('Connect Services')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogOpen}
          >
            {t('Add New Donation')}
          </Button>
        </Box>
      </BoxWrapper>
      {renderDialog()}
    </>
  );
};
