import React from 'react';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Modal from 'src/components/common/Modal/Modal';

interface CsvImportSuccessModalProps {
  handleClose: () => void;
}

export const CsvImportSuccessModal: React.FC<CsvImportSuccessModalProps> = ({
  handleClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={true}
      title={t('Info')}
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
                  'Your CSV import has started and your contacts will be in MPDX shortly. We will email you when your import is complete.',
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
                  onClick={handleClose}
                  variant="contained"
                  sx={{
                    bgcolor: 'mpdxBlue.main',
                    color: 'white',
                    height: '34px',
                  }}
                >
                  {t('Ok')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Modal>
  );
};
