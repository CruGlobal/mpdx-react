import React from 'react';
import { Box, Typography, styled, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

/*interface Props {}*/

const BoxWrapper = styled(Box)(({}) => ({
  backgroundColor: '#f0f0f0',
  height: 300,
  minWidth: 700,
  maxWidth: '97%',
  margin: 'auto',
  padding: 4,
  display: 'flex',
  flexDirection: 'column',
  justifyItems: 'center',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const ExpectedMonthlyTotalReportEmpty: React.FC = () => {
  const { t } = useTranslation();
  return (
    <BoxWrapper boxShadow={3}>
      <img src="bill.jpg" alt="bill" style={{ padding: 4 }}></img>
      <Typography variant="h5">
        {t('You have no expected donations this month')}
      </Typography>
      <Typography>
        {t(
          'You can setup an organization account to import historic donations or add a new donation.',
        )}
      </Typography>
      <Box style={{ padding: 4 }}>
        <Button variant="contained" href="services.html">
          Connect Services
        </Button>
        <Button variant="contained" color="primary" href="donation.html">
          Add New Donation
        </Button>
      </Box>
    </BoxWrapper>
  );
};
