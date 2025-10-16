import React, { useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { TFunction, useTranslation } from 'react-i18next';
import { PaddedBox } from 'src/components/Shared/styledComponents/PaddedBox';
import {
  CancelButton,
  SubmitButton,
} from 'src/components/common/Modal/ActionButtons/ActionButtons';
import Modal from 'src/components/common/Modal/Modal';
import { useRequiredSession } from 'src/hooks/useRequiredSession';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';
import theme from 'src/theme';

export const validateFile = ({
  file,
  t,
}: {
  file: File;
  t: TFunction;
}): { success: true } | { success: false; message: string } => {
  if (!file.name.endsWith('.tntmpd') && !file.name.endsWith('.tntdatasync')) {
    return {
      success: false,
      message: t(
        'Cannot upload file: file must be an .tntmpd or .tntdatasync file.',
      ),
    };
  }
  return { success: true };
};

interface OrganizationImportDataSyncModalProps {
  handleClose: () => void;
  organizationId: string;
  organizationName: string;
  accountListId: string;
}

const StyledTypography = styled(Typography)(() => ({
  marginTop: '10px',
}));

export const OrganizationImportDataSyncModal: React.FC<
  OrganizationImportDataSyncModalProps
> = ({ handleClose, organizationId, organizationName, accountListId }) => {
  const { t } = useTranslation();
  const { apiToken } = useRequiredSession();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!importFile) {
        throw new Error('Please select a file to upload.');
      }
      setIsSubmitting(true);

      const form = new FormData();
      form.append('data[type]', 'imports');
      form.append('data[attributes][file]', importFile);
      form.append(
        'data[relationships][source_account][data][id]',
        organizationId,
      );
      form.append(
        'data[relationships][source_account][data][type]',
        'organization_accounts',
      );

      const res = await fetch(
        `${process.env.REST_API_URL}account_lists/${accountListId}/imports/tnt_data_sync`,
        {
          method: 'POST',
          headers: {
            authorization: `Bearer ${apiToken}`,
          },
          body: form,
        },
      );

      if (res.status === 201) {
        enqueueSnackbar(
          `File successfully uploaded. The import to ${organizationName} will begin in the background.`,
          {
            variant: 'success',
          },
        );
      } else {
        throw new Error(t('Cannot upload file: server error'));
      }

      handleClose();
    } catch (err) {
      enqueueSnackbar(getErrorMessage(err), {
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const validationResult = validateFile({ file, t });
      if (!validationResult.success) {
        throw new Error(validationResult.message);
      }
      setImportFile(file);
      setIsValid(true);
    } catch (err) {
      setIsValid(false);
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
        <PaddedBox>
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
                  {t('Upload file here')}
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
        </PaddedBox>

        <DialogActions>
          <CancelButton onClick={handleClose} disabled={isSubmitting} />
          <SubmitButton disabled={isSubmitting || !isValid}>
            {t('Upload File')}
          </SubmitButton>
        </DialogActions>
      </form>
    </Modal>
  );
};
