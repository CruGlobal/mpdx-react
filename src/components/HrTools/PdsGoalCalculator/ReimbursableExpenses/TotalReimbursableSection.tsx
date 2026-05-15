import { Card, CardContent, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  REIMBURSABLE_FLOOR,
  calculateReimbursableTotals,
} from '../calculations/reimbursableExpenses';

const AmountTypography = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette.mpdxBlue.main,
}));

export const TotalReimbursableSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation } = usePdsGoalCalculator();

  if (!calculation) {
    return null;
  }

  const { total } = calculateReimbursableTotals(calculation);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{t('Total Reimbursable Expenses')}</Typography>
        <Typography variant="body2" color="text.secondary" pt={0.5}>
          {t(
            'Reimbursable expenses have a {{floor}} per month minimum. If the sum of your monthly entries (plus annual entries divided by 12) falls below {{floor}}, the {{floor}} minimum is used in your support goal instead.',
            {
              floor: currencyFormat(REIMBURSABLE_FLOOR, 'USD', locale),
            },
          )}
        </Typography>
        <AmountTypography data-testid="reimbursable-total">
          {currencyFormat(total, 'USD', locale)}
        </AmountTypography>
      </CardContent>
    </Card>
  );
};
