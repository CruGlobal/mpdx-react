import {
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';
import { useFormatters } from '../Shared/useFormatters';
import { SummaryTable } from './SummaryTable';

export const SalaryCapCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { formatCurrency, formatFraction, formatDecimal } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;
  const hasSpouse = !!hcmSpouse && !!spouseCalcs;

  return (
    <StepCard>
      <CardHeader title={t('Salary Cap Calculation')} />
      <CardContent>
        <SummaryTable>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{t('Category')}</TableCell>
              <TableCell scope="col">{hcmUser?.staffInfo.firstName}</TableCell>
              {hasSpouse && (
                <TableCell scope="col">
                  {hcmSpouse?.staffInfo.firstName}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">1. {t('Annual Base')}</TableCell>
              <TableCell>{formatCurrency(calcs?.annualBase)}</TableCell>
              {hasSpouse && (
                <TableCell>{formatCurrency(spouseCalcs.annualBase)}</TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">2. {t('Additional Salary')}</TableCell>
              <TableCell>{formatCurrency(calcs?.additionalSalary)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.additionalSalary)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                3. {t('Geographic Adjustment')}
                <span className="explanation">
                  {t('City: {{city}}', {
                    city: calculation?.location ?? t('None of these'),
                  })}
                  <br />
                  {t('Line 2 × Geographic Cost of Living Factor')}
                </span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.geographicAdjustment)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.geographicAdjustment)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">4. {t('Tenure')}</TableCell>
              <TableCell>{formatCurrency(calcs?.tenureAdjustment)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.tenureAdjustment)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                5. {t('Subtotal')}
                <span className="explanation">{t('Line 3 + Line 4')}</span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.oldSalaryCap)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.oldSalaryCap)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                6. {t('SECA')}
                <span className="explanation">
                  {t('(If applicable) Line 5 × {{seca}}', {
                    seca: formatDecimal(calcs?.secaEstimatedFraction),
                  })}
                  <br />
                  {t('Includes tax on the social security')}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.oldSecaAmount)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.oldSecaAmount)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">
                7. {t('Subtotal')}
                <span className="explanation">{t('Line 5 + Line 6')}</span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.capWithSeca)}</TableCell>
              {hasSpouse && (
                <TableCell>{formatCurrency(spouseCalcs.capWithSeca)}</TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row">8. {t('403(b) Contribution')}</TableCell>
              <TableCell>-</TableCell>
              {hasSpouse && <TableCell align="right">-</TableCell>}
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('403(b) Contribution Percentage')}
              </TableCell>
              <TableCell>
                {calcs?.contributing403bFraction
                  ? formatFraction(calcs.contributing403bFraction)
                  : '-'}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {spouseCalcs.contributing403bFraction
                    ? formatFraction(spouseCalcs.contributing403bFraction)
                    : '-'}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('1.00 Minus 403(b) Percentage')}
              </TableCell>
              <TableCell>{formatDecimal(calcs?.non403bFraction)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatDecimal(spouseCalcs.non403bFraction)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" colSpan={hasSpouse ? 3 : 2}>
                9. {t('Maximum Allowable Salary (CAP)')}
                <span className="explanation">
                  {t('Line 7 × Line 8b')}
                  <br />
                  {t(
                    'For a couple, the combined CAPs cannot exceed {{familyCap}}, with neither individual exceeding {{individualCap}}.',
                    {
                      familyCap: formatCurrency(calcs?.familyCap),
                      individualCap: formatCurrency(calcs?.individualCap),
                    },
                  )}
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('CAP')}
              </TableCell>
              <TableCell>{formatCurrency(calcs?.calculatedCap)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.calculatedCap)}
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('Minimum')}
              </TableCell>
              <TableCell>{formatCurrency(calculation?.salaryCap)}</TableCell>
              {hasSpouse && (
                <TableCell align="right">
                  {formatCurrency(calculation.spouseSalaryCap)}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </SummaryTable>
      </CardContent>
    </StepCard>
  );
};
