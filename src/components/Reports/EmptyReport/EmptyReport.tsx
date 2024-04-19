import React, { useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { AddDonation } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/AddDonation/AddDonation';
import { NextLinkComposed } from 'src/components/common/Links/NextLinkComposed';
import {
  DynamicModal,
  preloadModal,
} from 'src/components/common/Modal/DynamicModal';
import { useAccountListId } from 'src/hooks/useAccountListId';

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
  const [addDonationOpen, setAddDonationOpen] = useState(false);
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const handleCloseAddDonation = () => setAddDonationOpen(false);

  return (
    <BoxWrapper boxShadow={3} data-testid="EmptyReport">
      <Box mb={2}>
        <LocalAtmIcon fontSize="large" color="disabled" />
      </Box>
      <Typography variant="h5">{title}</Typography>
      {subTitle && <Typography>{subTitle}</Typography>}
      <Box sx={{ padding: 1, display: 'flex', gap: 2 }}>
        <Button
          component={NextLinkComposed}
          to={`/accountLists/${accountListId}/settings/integrations`}
          variant="contained"
        >
          {t('Connect Services')}
        </Button>
        {hasAddNewDonation && (
          <Button
            variant="contained"
            color="primary"
            onMouseEnter={preloadModal}
            onClick={() => setAddDonationOpen(true)}
          >
            {t('Add New Donation')}
          </Button>
        )}
      </Box>

      <DynamicModal
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
      </DynamicModal>
    </BoxWrapper>
  );
};
