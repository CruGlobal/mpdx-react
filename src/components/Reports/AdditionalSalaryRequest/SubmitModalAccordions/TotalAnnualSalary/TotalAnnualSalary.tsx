import { InfoSharp } from '@mui/icons-material';
import Warning from '@mui/icons-material/Warning';
import {
  Box,
  CardContent,
  LinearProgress,
  Typography,
  alpha,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import theme from 'src/theme';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { ModalAccordion } from '../ModalAccordion/ModalAccordion';
import { TotalSalaryTable } from './TotalSalaryTable';

// TODO: Update all zero values to use real data --> not sure what fields are needed

export const TotalAnnualSalary: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { values } = useFormikContext<CompleteFormValues>();

  const { maxAmount } = useAdditionalSalaryRequest();

  const difference =
    Number(values.totalAdditionalSalaryRequested) - (maxAmount ?? 0);

  return (
    <ModalAccordion
      backgroundColor={alpha(theme.palette.warning.light, 0.1)}
      icon={Warning}
      title={t('Total Annual Salary')}
      titleColor="warning.dark"
      subtitle={t('A review of your income')}
    >
      <CardContent>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              {t('Total Salary Requested')}
            </Typography>
            <InfoSharp sx={{ color: 'text.secondary' }} />
          </Box>
          <Typography>{`${currencyFormat(Number(values.totalAdditionalSalaryRequested), currency, locale)}/${currencyFormat(maxAmount ?? 0, currency, locale)}`}</Typography>
        </Box>
        <LinearProgress variant="determinate" value={100} color="warning" />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {t('Remaining in your Max Allowable Salary')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {`-${currencyFormat(
              difference < 0 ? 0 : difference,
              currency,
              locale,
              { showTrailingZeros: true },
            )}`}
          </Typography>
        </Box>
        <TotalSalaryTable />
      </CardContent>
    </ModalAccordion>
  );
};
