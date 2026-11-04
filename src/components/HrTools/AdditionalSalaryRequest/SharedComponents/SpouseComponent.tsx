import NextLink from 'next/link';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { useSalaryCalculations } from '../Shared/useSalaryCalculations';
import { useSpouseLink } from '../Shared/useSpouseLink';

export const SpouseComponent: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const locale = useLocale();
  const currency = 'USD';

  const { hasSpouse } = useAdditionalSalaryRequest();
  const { spouseLinkText, spouseLinkHref } = useSpouseLink();
  const { values } = useFormikContext<CompleteFormValues>();
  const { spouseCap } = useSalaryCalculations({ values });

  if (!hasSpouse) {
    return null;
  }

  // The other person's room, on either person's page: spouseCalculations is always the other person
  const remainingCap = spouseCap?.remainingCap;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
        }}
      >
        <ImportExportIcon
          fontSize="small"
          color="action"
          sx={{ transform: 'rotate(90deg)' }}
        />

        <Link component={NextLink} href={spouseLinkHref} shallow>
          {spouseLinkText}
        </Link>
      </Box>

      {typeof remainingCap === 'number' && (
        <Typography variant="caption" color="text.secondary">
          {t('Up to their remaining allowable salary of {{amount}}', {
            amount: currencyFormat(remainingCap, currency, locale),
          })}
        </Typography>
      )}
    </Box>
  );
};
