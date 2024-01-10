import React, { useState } from 'react';
import { DownloadForOffline } from '@mui/icons-material';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
} from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useLocale } from 'src/hooks/useLocale';
import { useGetExportDataLazyQuery } from '../../GetAccountPreferences.generated';
import { GetPersonalPreferencesQuery } from '../../GetPersonalPreferences.generated';

interface ExportAllDataAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
  loading: boolean;
  exportedAt?: string;
  accountListId: string;
  data?: GetPersonalPreferencesQuery | undefined;
}

export const ExportAllDataAccordion: React.FC<ExportAllDataAccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  loading,
  exportedAt,
  accountListId,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const label = t('Export All Data');
  const theme = useTheme();
  const locale = useLocale();

  const [exportData] = useGetExportDataLazyQuery({
    variables: {
      accountListId: accountListId ?? '',
    },
  });

  const dateTimeFormat = (date: DateTime | null, locale: string): string => {
    if (date === null) {
      return '';
    }
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
      hour12: true,
    }).format(date.toJSDate());
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    const response = await exportData();
    if (response.data?.getExportData === 'Success') {
      enqueueSnackbar(t('Export has started.'), {
        variant: 'success',
      });
      setConfirmation(true);
    }
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
    >
      {loading && <Skeleton height="90px" />}
      {!loading && (
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
                    data-testid={'input' + label.replace(/\s/g, '')}
                    onChange={handleChange}
                    inputProps={{
                      'aria-label': t(
                        'I, the user, acknowledge that once I export my data, I have 30 days until my data will be deleted on MPDX servers.',
                      ),
                    }}
                    required
                  />
                }
                label={t(
                  'I, the user, acknowledge that once I export my data, I have 30 days until my data will be deleted on MPDX servers.',
                )}
              />
              <FormHelperText>
                {t("Please ensure you've read the above before continuing.")}
              </FormHelperText>
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
            {t('Download All Data')}
          </Button>
        </form>
      )}
    </AccordionItem>
  );
};
