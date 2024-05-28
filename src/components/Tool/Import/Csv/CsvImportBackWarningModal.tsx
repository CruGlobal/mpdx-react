import React from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';

interface CsvImportBackWarningModalProps {
  handleClose: () => void;
  handleSubmit: () => void;
}

export const CsvImportBackWarningModal: React.FC<
  CsvImportBackWarningModalProps
> = ({ handleClose, handleSubmit }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={true}
      title={t('Confirm')}
      handleClose={handleClose}
      size={'sm'}
    >
      <Box>
        <Paper
          elevation={3}
          variant="outlined"
          style={{
            padding: '10px',
            marginTop: '10px',
          }}
        >
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography variant="body1">
                {t(
                  'Are you sure you want to navigate back to the upload step? You will lose all unsaved progress.',
                )}
              </Typography>
            </Grid>
            <Grid item sx={{ width: '100%' }}>
              <Box
                sx={{
                  padding: '10px 15px',
                  display: 'flex',
                  justifyContent: 'right',
                  width: '100%',
                }}
              >
                <Button
                  variant="text"
                  onClick={handleClose}
                  sx={{ marginRight: '10px' }}
                >
                  {t('No')}
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'mpdxBlue.main',
                    color: 'white',
                    height: '34px',
                  }}
                  onClick={handleSubmit}
                >
                  {t('Yes')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Modal>
  );
};
