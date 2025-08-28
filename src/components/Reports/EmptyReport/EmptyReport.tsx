import NextLink from 'next/link';
import React, { useState } from 'react';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import { Box, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  DynamicAddDonation,
  preloadAddDonation,
} from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/Items/AddDonation/DynamicAddDonation';
import { BoxWrapper } from 'src/components/Shared/styledComponents/BoxWrapper';
import Modal from 'src/components/common/Modal/Modal';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface Props {
  hasAddNewDonation?: boolean;
  title: string;
  subTitle?: string;
}

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
          component={NextLink}
          href={`/accountLists/${accountListId}/settings/integrations`}
          variant="contained"
        >
          {t('Connect Services')}
        </Button>
        {hasAddNewDonation && (
          <Button
            variant="contained"
            color="primary"
            onMouseEnter={preloadAddDonation}
            onClick={() => setAddDonationOpen(true)}
          >
            {t('Add New Donation')}
          </Button>
        )}
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
