import { Button, Grid, Typography, Box, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exportRest } from './exportRest';
import Modal from '../../../common/Modal/Modal';
import styled from '@mui/system/styled';
import theme from 'src/theme';

interface ExportsModalProps {
  ids: string[];
  accountListId: string;
  handleClose: () => void;
  openMailMergedLabelModal: () => void;
}

const ExportingSpinner: React.FC = () => (
  <CircularProgress
    sx={{ marginLeft: '1em', color: theme.palette.common.white }}
    size={20}
  />
);

const ExportActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.mpdxBlue.main,
  width: '100%',
  color: theme.palette.common.white,
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#006193',
  },
}));

export const ExportsModal: React.FC<ExportsModalProps> = ({
  accountListId,
  ids,
  handleClose,
  openMailMergedLabelModal,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [exporting, setExporting] = useState<
    'mail_merge' | 'advanced_csv' | 'advanced_xlsx' | null
  >(null);

  const restHandler = async (fileType: 'csv' | 'xlsx', mailing = false) => {
    try {
      if (fileType === 'csv') {
        setExporting(mailing ? 'mail_merge' : 'advanced_csv');
      } else {
        setExporting('advanced_xlsx');
      }
      await exportRest(accountListId, ids, fileType, mailing);
    } catch (err) {
      const error = (err as Error)?.message ?? JSON.stringify(err);
      enqueueSnackbar(error, {
        variant: 'error',
      });
    } finally {
      setExporting(null);
    }
    handleClose();
  };

  return (
    <Modal title={t('Export Contacts')} isOpen={true} handleClose={handleClose}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton
              onClick={() => {
                openMailMergedLabelModal();
                handleClose();
              }}
              disabled={exporting !== null}
            >
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
            <ExportActionButton
              onClick={() => restHandler('csv', true)}
              disabled={exporting !== null}
            >
              {t('CSV for Mail Merge')}
              {exporting === 'mail_merge' && <ExportingSpinner />}
            </ExportActionButton>
            <Typography>
              {t(
                'Best for making mailing labels. Addresses will be formatted based on country.',
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton
              onClick={() => restHandler('csv')}
              disabled={exporting !== null}
            >
              {t('Advanced CSV')}
              {exporting === 'advanced_csv' && <ExportingSpinner />}
            </ExportActionButton>
            <Typography>
              {t(
                'All of the information for your contacts, best for advanced sorting/filtering and importing into other software.',
              )}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center" p={2}>
            <ExportActionButton
              onClick={() => restHandler('xlsx')}
              disabled={exporting !== null}
            >
              {t('Advanced Excel (XLSX)')}
              {exporting === 'advanced_xlsx' && <ExportingSpinner />}
            </ExportActionButton>
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
