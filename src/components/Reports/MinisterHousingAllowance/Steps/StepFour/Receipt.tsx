import { Edit, PrintSharp } from '@mui/icons-material';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { useMinisterHousingAllowance } from '../../Shared/Context/MinisterHousingAllowanceContext';
import { PageEnum } from '../../Shared/sharedTypes';

//TODO: Update links and functionality for Edit and Print options

interface ReceiptProps {
  availableDate: string | null;
  deadlineDate: string | null;
}

export const Receipt: React.FC<ReceiptProps> = ({
  availableDate,
  deadlineDate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const accountListId = useAccountListId();
  const editLink = `/accountLists/${accountListId}/reports/housingAllowance/edit`;

  const { pageType } = useMinisterHousingAllowance();

  const available = availableDate
    ? dateFormatShort(DateTime.fromISO(availableDate), locale)
    : null;

  //TODO: Not sure what to write if deadline date is null
  const deadline = deadlineDate
    ? dateFormatShort(DateTime.fromISO(deadlineDate), locale)
    : null;

  const approval = available
    ? t(`approval effective ${available}`)
    : t('approval soon');

  const isEdit = pageType === PageEnum.Edit;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEdit
          ? t('Thank you for updating your MHA Request!')
          : t('Thank you for Submitting your MHA Request!')}
      </Typography>
      <Alert severity="success">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>
            {isEdit
              ? t("You've successfully updated your MHA Request!")
              : t("You've successfully submitted your MHA Request!")}
          </Typography>
          <Typography>
            {t(
              'We will review your information and you will receive notice for your {{approval}}.',
              { approval, interpolation: { escapeValue: false } },
            )}
          </Typography>
        </Box>
      </Alert>
      <Box sx={{ mt: 4 }}>
        <Edit
          fontSize="small"
          sx={{ verticalAlign: 'middle', opacity: 0.56 }}
        />{' '}
        <Link href={editLink}>
          {t('Edit your MHA Request (Not available after {{date}})', {
            date: deadline,
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
