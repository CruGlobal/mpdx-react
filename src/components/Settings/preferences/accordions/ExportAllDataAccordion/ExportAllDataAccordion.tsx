import React, { useState } from 'react';
import { DownloadForOffline } from '@mui/icons-material';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { useLocale } from 'src/hooks/useLocale';
import { dateTimeFormat } from 'src/lib/intlFormat';
import { useExportDataMutation } from '../../GetAccountPreferences.generated';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';

interface ExportAllDataAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  exportedAt?: string;
  accountListId: string;
  data?: GetPersonalPreferencesQuery | undefined;
  disabled?: boolean;
}

export const ExportAllDataAccordion: React.FC<ExportAllDataAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  exportedAt,
  accountListId,
  disabled,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { appName } = useGetAppSettings();
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const label = t('Export All Data');
  const theme = useTheme();
  const locale = useLocale();

  const [exportData] = useExportDataMutation();

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    await exportData({
      variables: {
        input: {
          accountListId: accountListId,
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Export has started.'), {
          variant: 'success',
        });
        setConfirmation(true);
      },
      onError: () => {
        enqueueSnackbar(t('And error occured.'), {
          variant: 'error',
        });
      },
    });
  };

  const handleChange = () => {
    setAcknowledged(!acknowledged);
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={label}
      value={''}
      fullWidth
      disabled={disabled}
    >
      <form onSubmit={onSubmit}>
        <FieldWrapper>
          {exportedAt && (
            <Alert severity="info" icon={<DownloadForOffline />}>
              {t(
                `Your last export was on ${dateTimeFormat(
                  DateTime.fromISO(exportedAt),
                  locale,
                )}`,
              )}
            </Alert>
          )}
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name={'acknowledge'}
                  onChange={handleChange}
                  inputProps={{
                    'aria-label': t(
                      `I, the user, acknowledge that once I export my data, I have 30 days until my data will be deleted on {{appName}} servers.`,
                      { appName },
                    ),
                  }}
                  required
                />
              }
              label={t(
                `I, the user, acknowledge that once I export my data, I have 30 days until my data will be deleted on {{appName}} servers.`,
                { appName },
              )}
            />
            <Typography sx={{ fontStyle: 'italic' }}>
              {t("Please ensure you've read the above before continuing.")}
            </Typography>
          </FormGroup>
        </FieldWrapper>
        {confirmation && (
          <Alert severity="success">
            {t(
              'Once the export is completed, we will send you an email with a link to download your export.',
            )}
          </Alert>
        )}
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: theme.spacing(2) }}
          type="submit"
          disabled={!acknowledged || isSubmitting}
        >
          {t('Export All Data')}
        </Button>
      </form>
    </AccordionItem>
  );
};
