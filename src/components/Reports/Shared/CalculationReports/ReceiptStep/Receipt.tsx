import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Dispatch, SetStateAction } from 'react';
import { Edit, RemoveRedEyeSharp } from '@mui/icons-material';
import { Alert, Box, Button, Link, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';

interface ReceiptProps {
  formTitle: string;
  buttonText: string;
  buttonLink: string;
  alertText?: string;
  editLink?: string;
  viewLink?: string;
  isEdit?: boolean;
  availableDate?: string | null;
  deadlineDate?: string | null;
  setIsComplete?: Dispatch<SetStateAction<boolean>>;
}

export const Receipt: React.FC<ReceiptProps> = ({
  formTitle,
  buttonText,
  buttonLink,
  alertText,
  editLink,
  viewLink,
  isEdit,
  availableDate,
  deadlineDate,
  setIsComplete,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();

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

  const handlePrint = async () => {
    if (!viewLink) {
      return;
    }

    setIsComplete?.(true);
    await router.push(viewLink);
    setTimeout(() => window.print(), 500);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {isEdit
          ? t(`Thank you for updating your ${formTitle}!`)
          : t(`Thank you for Submitting your ${formTitle}!`)}
      </Typography>
      <Alert severity="success">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>
            {isEdit
              ? t(`You've successfully updated your ${formTitle}!`)
              : t(`You've successfully submitted your ${formTitle}!`)}
          </Typography>
          <Typography>
            {alertText
              ? alertText
              : t(
                  'We will review your information and you will receive notice for your {{approval}}.',
                  { approval, interpolation: { escapeValue: false } },
                )}
          </Typography>
        </Box>
      </Alert>
      {editLink && (
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
      )}
      <Box sx={{ mt: 4 }}>
        <RemoveRedEyeSharp
          fontSize="small"
          sx={{ verticalAlign: 'middle', opacity: 0.56 }}
        />{' '}
        <Link onClick={handlePrint} sx={{ cursor: 'pointer' }}>
          {t(`View or print a copy of your submitted ${formTitle}`)}
        </Link>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Button component={NextLink} href={buttonLink} variant="contained">
          {buttonText}
        </Button>
      </Box>
    </Box>
  );
};
