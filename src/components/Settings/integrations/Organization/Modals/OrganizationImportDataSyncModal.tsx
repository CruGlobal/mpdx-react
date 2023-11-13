import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { styled } from '@mui/material/styles';
import {
  Box,
  DialogActions,
  Typography,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import {
  SubmitButton,
  CancelButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import theme from 'src/theme';
import Modal from 'src/components/common/Modal/Modal';
import { validateFile } from 'src/components/Shared/FileUploads/tntConnectDataSync';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';

interface OrganizationImportDataSyncModalProps {
  handleClose: () => void;
  organizationId: string;
  organizationName: string;
  accountListId: string;
}

const StyledBox = styled(Box)(() => ({
  padding: '0 10px',
}));

const StyledTypography = styled(Typography)(() => ({
  marginTop: '10px',
}));

export const OrganizationImportDataSyncModal: React.FC<
  OrganizationImportDataSyncModalProps
> = ({ handleClose, organizationId, organizationName, accountListId }) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!importFile) throw new Error('Please select a file to upload.');
      // TODO
      setIsSubmitting(true);
      setIsSubmitting(false);

      const form = new FormData();
      form.append('accountListId', accountListId);
      form.append('organizationId', organizationId);
      form.append('tntDataSync', importFile);

      const res = await fetch(`/api/uploads/tnt-data-sync`, {
        method: 'POST',
        body: form,
      }).catch(() => {
        throw new Error(t('Cannot upload avatar: server error'));
      });

      if (res.status === 201) {
        enqueueSnackbar(
          `File successfully uploaded. The import to ${organizationName} will begin in the background.`,
          {
            variant: 'success',
          },
        );
      }

      setIsSubmitting(false);
      handleClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), {
        variant: 'error',
      });
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const validationResult = validateFile({ file, t });
      if (!validationResult.success) throw new Error(validationResult.message);
      setImportFile(file);
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), {
        variant: 'error',
      });
    }
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
                    data-testid="importFileUploader"
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
