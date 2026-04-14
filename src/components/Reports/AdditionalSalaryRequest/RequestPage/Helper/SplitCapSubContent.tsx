import Link from 'next/link';
import { Box, LinearProgress, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';

interface SplitCapSubContentProps {
  spouseName: string;
}

export const SplitCapSubContent: React.FC<SplitCapSubContentProps> = ({
  spouseName,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';
  const { values } = useFormikContext<CompleteFormValues>();
  const {
    spouseTotalAnnualSalary,
    spouseIndividualCap,
    spouseRemainingCap,
  } = useSalaryCalculations({ values });

  const showBar =
    spouseIndividualCap !== null &&
    spouseIndividualCap > 0 &&
    spouseTotalAnnualSalary !== null &&
    spouseRemainingCap !== null;

  const totalFormatted = showBar
    ? currencyFormat(spouseTotalAnnualSalary, currency, locale, {
        showTrailingZeros: true,
      })
    : '';
  const capFormatted = showBar
    ? currencyFormat(spouseIndividualCap, currency, locale, {
        showTrailingZeros: true,
      })
    : '';
  const remainingFormatted = showBar
    ? currencyFormat(spouseRemainingCap, currency, locale, {
        showTrailingZeros: true,
      })
    : '';

  const progressValue = showBar
    ? Math.min(
        100,
        Math.max(0, (spouseTotalAnnualSalary / spouseIndividualCap) * 100),
      )
    : 0;

  return (
    <>
      <Trans t={t} values={{ spouseName }} parent="span">
        Please make adjustments to your request to continue. You may make a
        separate request up to {spouseName}&apos;s maximum allowable salary if
        desired. After using both you and {spouseName}&apos;s maximum allowable
        salary, any additional requests can be submitted online but will require
        approval through our{' '}
        <Link
          href="/"
          style={{ display: 'inline', color: theme.palette.primary.main }}
        >
          Progressive Approvals
        </Link>{' '}
        process.
      </Trans>
      {showBar && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              mb: 1,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body1">
              {t("{{spouseName}}'s Salary / Max Allowable Salary", {
                spouseName,
              })}
            </Typography>
            <Typography>
              {t('{{totalFormatted}} / {{capFormatted}}', {
                totalFormatted,
                capFormatted,
              })}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressValue}
            color="primary"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {t("Remaining in {{spouseName}}'s Max Allowable Salary", {
                spouseName,
              })}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {remainingFormatted}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};
