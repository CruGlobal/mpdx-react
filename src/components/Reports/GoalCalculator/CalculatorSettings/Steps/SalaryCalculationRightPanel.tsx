import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { CalculationTableWrapper } from '../../Shared/CalculationTableWrapper';

export type SalaryCalculationResults = {
  annualBaseSalary: number;
  additionalSalary: number;
  geographicAdjustment: number;
  tenureAddOn: number;
  subtotal1: number;
  seca: number;
  subtotal2: number;
  contributionPercent: number;
  salaryCap: number;
  total: number;
};

export const defaultSalaryCalculationResults: SalaryCalculationResults = {
  annualBaseSalary: 28500,
  additionalSalary: 54150,
  geographicAdjustment: 57399,
  tenureAddOn: 4200,
  subtotal1: 61599,
  seca: 13551.78,
  subtotal2: 75150.78,
  contributionPercent: 0.15,
  salaryCap: 88412.68,
  total: 57500,
};

type Props = {
  results?: SalaryCalculationResults;
};

export const SalaryCalculationRightPanel: React.FC<Props> = ({
  results = defaultSalaryCalculationResults,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <CalculationTableWrapper label={t('Salary Calculation Table')}>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="salary calculation table">
          <TableHead>
            <TableRow>
              <TableCell>{t('Line')}</TableCell>
              <TableCell>{t('Category')}</TableCell>
              <TableCell>{t('Formula')}</TableCell>
              <TableCell>{t('Result')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>1</TableCell>
              <TableCell>{t('Annual Base Salary')}</TableCell>
              <TableCell>{t('Fixed Amount')}</TableCell>
              <TableCell>
                {currencyFormat(results.annualBaseSalary, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>2</TableCell>
              <TableCell>{t('Additional Salary')}</TableCell>
              <TableCell>{t('Line 1 × 1.90')}</TableCell>
              <TableCell>
                {currencyFormat(results.additionalSalary, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>3</TableCell>
              <TableCell>{t('Geographic Adjustment')}</TableCell>
              <TableCell>{t('Line 2 × 1.06')}</TableCell>
              <TableCell>
                {currencyFormat(results.geographicAdjustment, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>4</TableCell>
              <TableCell>{t('Tenure Add on')}</TableCell>
              <TableCell>{t('Fixed Amount')}</TableCell>
              <TableCell>
                {currencyFormat(results.tenureAddOn, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>5</TableCell>
              <TableCell>{t('Subtotal')}</TableCell>
              <TableCell>{t('Line 3 + 4')}</TableCell>
              <TableCell>
                {currencyFormat(results.subtotal1, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>6</TableCell>
              <TableCell>{t('SECA')}</TableCell>
              <TableCell>{t('Line 5 × 0.22')}</TableCell>
              <TableCell>
                {currencyFormat(results.seca, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>7</TableCell>
              <TableCell>{t('Subtotal')}</TableCell>
              <TableCell>{t('Line 5 + 6')}</TableCell>
              <TableCell>
                {currencyFormat(results.subtotal2, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>8</TableCell>
              <TableCell>{t('403b Contribution %')}</TableCell>
              <TableCell>{t('Fixed Amount')}</TableCell>
              <TableCell>
                {percentageFormat(results.contributionPercent, locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>9a</TableCell>
              <TableCell>{t('Total')}</TableCell>
              <TableCell>{t('Line 7 ÷ (1 - Line 8)')}</TableCell>
              <TableCell>
                {currencyFormat(results.total, 'USD', locale)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>9b</TableCell>
              <TableCell>{t('Salary Cap')}</TableCell>
              <TableCell>{t('Fixed amount')}</TableCell>
              <TableCell>
                {currencyFormat(results.salaryCap, 'USD', locale)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </CalculationTableWrapper>
  );
};
