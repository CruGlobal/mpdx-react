import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogActions, Typography, Button, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';
import Modal from 'src/components/common/Modal/Modal';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from 'src/theme';
import { Organization } from '../../../../../graphql/types.generated';
import { validateFile } from 'src/components/Shared/FileUploads/tntConnectDataSync';

interface OrganizationImportDataSyncModalProps {
  handleClose: () => void;
  organization?: Omit<Organization, 'createdAt' | 'updatedAt'>;
}

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

const StyledTypography = styled(Typography)(() => ({
  marginTop: '10px',
}));

export const OrganizationImportDataSyncModal: React.FC<
  OrganizationImportDataSyncModalProps
> = ({ handleClose, organization }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleSubmit = (attributes) => {
    // TODO
    setIsSubmitting(true);
    setIsSubmitting(false);
    return {
      attributes,
      organization,
    };
    handleClose();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationResult = validateFile({ file, t });
    if (!validationResult.success) {
      enqueueSnackbar(validationResult.message, {
        variant: 'error',
      });
      return;
    }
    setImportFile(file);
  };

  return (
    <Modal
      isOpen={true}
      title={t('Import TntConnect DataSync file')}
      handleClose={handleClose}
      size={'sm'}
    >
      <form onSubmit={handleSubmit}>
        <StyledBox>
          <StyledTypography color={theme.palette.mpdxYellow.contrastText}>
            {t(
              'This file should be a TntConnect DataSync file (.tntdatasync or .tntmpd) from your organization, not your local TntConnect database file (.mpddb).',
            )}
          </StyledTypography>
          <StyledTypography>
            {t(
              'To import your TntConnect database, go to Import from TntConnect',
            )}
          </StyledTypography>

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
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  component="label"
                  disabled={isSubmitting}
                >
                  Upload file here
                  <input
                    hidden
                    accept=".tntmpd, .tntdatasync"
                    multiple
                    type="file"
                    onChange={handleFileChange}
                  />
                </Button>
              </Grid>
              <Grid item xs={8}>
                <Box>
                  <Typography>
                    {importFile?.name ?? 'No File Chosen'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </StyledBox>

        <DialogActions>
          <CancelButton onClick={handleClose} disabled={isSubmitting} />
          <SubmitButton disabled={isSubmitting}>
            {t('Upload File')}
          </SubmitButton>
        </DialogActions>
      </form>
    </Modal>
  );
};
