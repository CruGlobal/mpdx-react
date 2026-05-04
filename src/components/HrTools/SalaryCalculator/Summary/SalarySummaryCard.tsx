import {
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffectiveSalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';
import { useFormatters } from '../Shared/useFormatters';

export const SalarySummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { data: effectiveData } = useEffectiveSalaryCalculationQuery();
  const oldCalculation = effectiveData?.salaryRequest;
  const ownRequest =
    oldCalculation?.personNumber === hcmUser?.staffInfo.personNumber;
  const oldCalculations = ownRequest
    ? oldCalculation?.calculations
    : oldCalculation?.spouseCalculations;
  const oldSpouseCalculations = ownRequest
    ? oldCalculation?.spouseCalculations
    : oldCalculation?.calculations;
  const { formatCurrency, formatFraction } = useFormatters();

  return (
    <StepCard
      sx={{
        '.MuiTableCell-head.MuiTableCell-root': {
          // Make sure that both tables' headers line up
          width: '25%',
        },
      }}
    >
      <CardHeader title={t('New Salary Calculation Summary')} />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell scope="col">
                {hcmUser?.staffInfo.preferredName}
              </TableCell>
              {oldCalculation && <TableCell scope="col">{t('Old')}</TableCell>}
              <TableCell scope="col">{t('New')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">{t('Requested Salary')}</TableCell>
              {oldCalculation && (
                <TableCell>
                  {formatCurrency(
                    ownRequest
                      ? oldCalculation.salary
                      : oldCalculation.spouseSalary,
                  )}
                </TableCell>
              )}
              <TableCell>{formatCurrency(calculation?.salary)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('MHA')}</TableCell>
              {oldCalculation && (
                <TableCell>
                  {formatCurrency(
                    ownRequest
                      ? oldCalculation.mhaAmount
                      : oldCalculation.spouseMhaAmount,
                  )}
                </TableCell>
              )}
              <TableCell>{formatCurrency(calculation?.mhaAmount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('403(b) Contribution')}</TableCell>
              {oldCalculation && (
                <TableCell>
                  {formatFraction(oldCalculations?.contributing403bFraction)}
                </TableCell>
              )}
              <TableCell>
                {formatFraction(
                  calculation?.calculations?.contributing403bFraction,
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('Max Allowable Salary')}</TableCell>
              {oldCalculation && (
                <TableCell>
                  {formatCurrency(oldCalculations?.effectiveCap)}
                </TableCell>
              )}
              <TableCell>
                {formatCurrency(calculation?.calculations.effectiveCap)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {hcmSpouse && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell scope="col">
                  {hcmSpouse?.staffInfo.preferredName}
                </TableCell>
                {oldCalculation && (
                  <TableCell scope="col">{t('Old')}</TableCell>
                )}
                <TableCell scope="col">{t('New')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell scope="row">{t('Requested Salary')}</TableCell>
                {oldCalculation && (
                  <TableCell>
                    {formatCurrency(
                      ownRequest
                        ? oldCalculation.spouseSalary
                        : oldCalculation.salary,
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {formatCurrency(calculation?.spouseSalary)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">{t('MHA')}</TableCell>
                {oldCalculation && (
                  <TableCell>
                    {formatCurrency(
                      ownRequest
                        ? oldCalculation.spouseMhaAmount
                        : oldCalculation.mhaAmount,
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {formatCurrency(calculation?.spouseMhaAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">{t('403(b) Contribution')}</TableCell>
                {oldCalculation && (
                  <TableCell>
                    {formatFraction(
                      oldSpouseCalculations?.contributing403bFraction,
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {formatFraction(
                    calculation?.spouseCalculations?.contributing403bFraction,
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">{t('Max Allowable Salary')}</TableCell>
                {oldCalculation && (
                  <TableCell>
                    {formatCurrency(oldSpouseCalculations?.effectiveCap)}
                  </TableCell>
                )}
                <TableCell>
                  {formatCurrency(
                    calculation?.spouseCalculations?.effectiveCap,
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </StepCard>
  );
};
