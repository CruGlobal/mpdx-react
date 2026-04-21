import InfoIcon from '@mui/icons-material/Info';
import {
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { calculateReimbursableTotals } from '../calculations/reimbursableExpenses';

const AmountTypography = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: theme.palette.mpdxBlue.main,
}));

export const TotalReimbursableSection: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { calculation } = usePdsGoalCalculator();
  const { goalMiscConstants } = useGoalCalculatorConstants();
  const reimbursableFloor =
    goalMiscConstants.ADDITIONAL_RATES?.MINIMUM_REIMBURSABLE?.fee ?? 0;

  if (!calculation) {
    return null;
  }

  const { total } = calculateReimbursableTotals(calculation, reimbursableFloor);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant="h6">
            {t('Total Reimbursable Expenses')}
          </Typography>
          <Tooltip
            title={t(
              'The total is the greater of the {{floor}} minimum or your calculated amount.',
              {
                floor: currencyFormat(reimbursableFloor, 'USD', locale),
              },
            )}
          >
            <InfoIcon
              color="action"
              aria-label={t('Total reimbursable information')}
            />
          </Tooltip>
        </Stack>
        <AmountTypography data-testid="reimbursable-total">
          {currencyFormat(total, 'USD', locale)}
        </AmountTypography>
      </CardContent>
    </Card>
  );
};
