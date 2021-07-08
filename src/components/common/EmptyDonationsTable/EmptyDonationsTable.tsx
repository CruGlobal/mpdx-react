import React from 'react';
import { Box, Typography, styled, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

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

export const EmptyDonationsTable: React.FC<Props> = ({ title }) => {
  const { t } = useTranslation();

  const connectServices = () => {
    //TODO: Open screen to connect services
  };

  const addNewDonation = () => {
    //TODO: open modal for creating donation
  };

  return (
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
          Connect Services
        </Button>
        <Button variant="contained" color="primary" onClick={addNewDonation}>
          Add New Donation
        </Button>
      </Box>
    </BoxWrapper>
  );
};
