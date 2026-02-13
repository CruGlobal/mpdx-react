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
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { ModalAccordion } from '../ModalAccordion/ModalAccordion';
import { TotalSalaryTable } from './TotalSalaryTable';

interface TotalAnnualSalaryProps {
  onForm?: boolean;
}

export const TotalSalaryRequested: React.FC<TotalAnnualSalaryProps> = ({
  onForm,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const currency = 'USD';

  const { values } = useFormikContext<CompleteFormValues>();
  const { requestData } = useAdditionalSalaryRequest();

  const asrValues = requestData?.latestAdditionalSalaryRequest;
  const calculations = asrValues?.calculations;
  const individualCap = calculations?.currentSalaryCap ?? 5000;

  const { totalAnnualSalary } = useSalaryCalculations({
    values,
    calculations,
  });

  const remainingInMaxAllowable = individualCap - totalAnnualSalary;

  return (
    <ModalAccordion
      backgroundColor={alpha(theme.palette.warning.light, 0.1)}
      icon={Warning}
      title={t('Total Salary Requested')}
      titleColor="warning.dark"
      subtitle={t('A review of your income')}
      onForm={onForm}
    >
      <CardContent>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              {t('Total Salary Requested / Max Allowable Salary')}
            </Typography>
          </Box>
          <Typography>
            {currencyFormat(Number(totalAnnualSalary), currency, locale)}/
            {currencyFormat(individualCap, currency, locale)}
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={100} color="warning" />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {t('Remaining in your Max Allowable Salary')}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            {currencyFormat(remainingInMaxAllowable, currency, locale, {
              showTrailingZeros: true,
            })}
          </Typography>
        </Box>
        <TotalSalaryTable />
      </CardContent>
    </ModalAccordion>
  );
};
