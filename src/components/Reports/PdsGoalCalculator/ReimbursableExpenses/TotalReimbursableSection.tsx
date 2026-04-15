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
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat } from 'src/lib/intlFormat';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import {
  REIMBURSABLE_FLOOR,
  calculateReimbursableTotals,
} from './reimbursableExpenses';

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
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography variant="h6">
            {t('Total Reimbursable Expenses')}
          </Typography>
          <Tooltip
            title={t(
              'The total is the greater of the {{floor}} minimum or your calculated amount.',
              {
                floor: currencyFormat(REIMBURSABLE_FLOOR, 'USD', locale),
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
