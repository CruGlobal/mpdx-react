import { Button, Grid, Typography, Box, styled } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';

interface ExportsModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
}

const ExportActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  width: '100%',
  color: theme.palette.common.white,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#006193',
  },
}));

export const ExportsModal: React.FC<ExportsModalProps> = ({ handleClose }) => {
  const { t } = useTranslation();
  return (
    <Modal title={t('Export Contacts')} isOpen={true} handleClose={handleClose}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton>
              {t('PDF of Mail Merged Labels')}
            </ExportActionButton>
            <Typography>
              {t(
                'Addresses will be formatted based on country. (Experimental)',
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton>{t('CSV for Mail Merge')}</ExportActionButton>
            <Typography>
              {t(
                'Best for making mailing labels. Addresses will be formatted based on country.',
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton>{t('Advanced CSV')}</ExportActionButton>
            <Typography>
              {t(
                'All of the information for your contacts, best for advanced sorting/filtering and importing into other software.',
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton>{t('Advanced Excel (XLSX')}</ExportActionButton>
            <Typography>
              {t(
                `All of the information for your contacts in Excel's default XLSX format.`,
              )}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Modal>
  );
};
