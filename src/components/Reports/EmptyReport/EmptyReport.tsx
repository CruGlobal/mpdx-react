import React from 'react';
import { Box, Typography, styled, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import HandoffLink from 'src/components/HandoffLink';

interface Props {
  title: string;
  subTitle?: string;
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

export const EmptyReport: React.FC<Props> = ({ title, subTitle }) => {
  const { t } = useTranslation();

  const addNewDonation = () => {
    return;
  };

  return (
    <BoxWrapper boxShadow={3}>
      <img src="bill.jpg" alt="bill" style={{ padding: 4 }}></img>
      <Typography variant="h5">{t(title)}</Typography>
      {subTitle && <Typography>{t(subTitle)}</Typography>}
      <Box style={{ padding: 4 }}>
        <HandoffLink path="/preferences/integrations">
          <Button variant="contained">Connect Services</Button>
        </HandoffLink>
        <Button variant="contained" color="primary" onClick={addNewDonation}>
          Add New Donation
        </Button>
      </Box>
    </BoxWrapper>
  );
};
