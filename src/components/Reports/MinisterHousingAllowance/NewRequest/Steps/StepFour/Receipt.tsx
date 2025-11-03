import { Edit, PrintSharp } from '@mui/icons-material';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { mocks } from '../../../Shared/mockData';

//TODO: Update links and functionality for Edit and Print options

export const Receipt: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();

  const availableDate = dateFormatShort(
    DateTime.fromISO(
      mocks[4].mhaDetails.staffMHA?.availableDate ?? DateTime.now().toISO(),
    ),
    locale,
  );

  const deadlineDate = dateFormatShort(
    DateTime.fromISO(
      mocks[4].mhaDetails.staffMHA?.deadlineDate ?? DateTime.now().toISO(),
    ),
    locale,
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('Thank you for Submitting your MHA Request!')}
      </Typography>
      <Alert severity="success">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography>
            <b>{t("You've successfully submitted your MHA Request!")}</b>
          </Typography>
          <Typography>
            {t(
              'We will review your information and you will receive notice for your approval effective {{date}}.',
              { date: availableDate, interpolation: { escapeValue: false } },
            )}
          </Typography>
        </Box>
      </Alert>
      <Box sx={{ mt: 4 }}>
        <Edit
          fontSize="small"
          sx={{ verticalAlign: 'middle', opacity: 0.56 }}
        />{' '}
        <Link href="">
          {t('Edit your MHA Request (Not available after {{date}})', {
            date: deadlineDate,
            interpolation: { escapeValue: false },
          })}
        </Link>
      </Box>
      <Box sx={{ mt: 4 }}>
        <PrintSharp
          fontSize="small"
          sx={{ verticalAlign: 'middle', opacity: 0.56 }}
        />{' '}
        <Link href="">{t('Print a copy of your submitted MHA Request')}</Link>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained">{t('View Your MHA')}</Button>
      </Box>
    </Box>
  );
};
