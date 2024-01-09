import React from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import HandoffLink from 'src/components/HandoffLink';

interface Props {
  hasAddNewDonation?: boolean;
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

export const EmptyReport: React.FC<Props> = ({
  hasAddNewDonation = true,
  title,
  subTitle,
}) => {
  const { t } = useTranslation();

  const addNewDonation = () => {
    // To be implemented by https://jira.cru.org/browse/MPDX-7053

    return;
  };

  return (
    <BoxWrapper boxShadow={3} data-testid="EmptyReport">
      <Box mb={2}>
        <LocalAtmIcon fontSize="large" color="disabled" />
      </Box>
      <Typography variant="h5">{title}</Typography>
      {subTitle && <Typography>{subTitle}</Typography>}
      <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
        <HandoffLink path="/preferences/integrations">
          <Button variant="contained">{t('Connect Services')}</Button>
        </HandoffLink>
        {hasAddNewDonation && (
          <Button variant="contained" color="primary" onClick={addNewDonation}>
            {t('Add New Donation')}
          </Button>
        )}
      </Box>
    </BoxWrapper>
  );
};
