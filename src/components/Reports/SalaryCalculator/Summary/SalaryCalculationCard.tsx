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
import { SummaryTable } from './SummaryTable';
import { useFormatters } from './useFormatters';

export const SalaryCalculationCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { formatCurrency, formatPercentage, formatDecimal } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;
  const hasSpouse = !!hcmSpouse && !!spouseCalcs;

  return (
    <StepCard>
      <CardHeader title={t('Salary Calculation Summary')} />
      <CardContent>
        <SummaryTable>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{t('Category')}</TableCell>
              <TableCell scope="col">{hcmUser?.staffInfo.firstName}</TableCell>
              {hasSpouse && (
                <TableCell scope="col">
                  {hcmSpouse.staffInfo.firstName}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">
                10. {t('Requested Salary')}
                <span className="explanation">
                  {t('Before SECA and 403(b)')}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.annualBase)}</TableCell>
              {hasSpouse && (
                <TableCell>{formatCurrency(spouseCalcs?.annualBase)}</TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">11. {t('Taxes')}</TableCell>
              <TableCell>{formatCurrency(calcs?.oldSecaAmount)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.oldSecaAmount)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('SECA')}
                <span className="explanation">
                  {t('(If applicable) Line 10 x 0.22')}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.oldSecaAmount)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.oldSecaAmount)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('State and Local')}
                <span className="explanation">
                  {t('(If selected in Step 6) Line 10 x 0.05')}
                </span>
              </TableCell>
              <TableCell>TBD</TableCell>
              {hasSpouse && <TableCell>TBD</TableCell>}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                12. {t('Subtotal')}
                <span className="explanation">
                  {t('Line 10 + Line 11')}
                  <br />
                  {t('This amount must be at least {{ min }}', {
                    min: formatCurrency(calcs?.minimumRequiredSalary),
                  })}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calculation?.salary)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(calculation.spouseSalary)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" colSpan={3}>
                13. {t('403(b) Contribution')}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('Tax-deferred (before tax) percentage')}
              </TableCell>
              <TableCell>
                {formatPercentage(
                  hcmUser?.fourOThreeB.currentTaxDeferredContributionPercentage,
                )}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatPercentage(
                    hcmSpouse.fourOThreeB
                      .currentTaxDeferredContributionPercentage,
                  )}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('Roth (after-tax) percentage')}
              </TableCell>
              <TableCell>
                {formatPercentage(
                  hcmUser?.fourOThreeB.currentRothContributionPercentage,
                )}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatPercentage(
                    hcmSpouse.fourOThreeB.currentRothContributionPercentage,
                  )}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                c. {t('Total Contribution')}
                <span className="explanation">{t('Line 13a + 13b')}</span>
              </TableCell>
              <TableCell>
                {formatPercentage(
                  calcs ? calcs.contributing403bFraction * 100 : null,
                )}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatPercentage(
                    spouseCalcs?.contributing403bFraction * 100,
                  )}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                d. {t('1.00 minus 403(b) percentage')}
              </TableCell>
              <TableCell>{formatDecimal(calcs?.non403bFraction)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatDecimal(spouseCalcs?.non403bFraction)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                14. {t('Gross Salary')}
                <span className="explanation">
                  {t('Line 12 ÷ Line 13d')}
                  <br />
                  {t(
                    'If this amount is greater than your CAP (the lesser of line 9a or 9b), it must be approved.',
                  )}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.effectiveCap)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs?.effectiveCap)}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </SummaryTable>
      </CardContent>
    </StepCard>
  );
};
