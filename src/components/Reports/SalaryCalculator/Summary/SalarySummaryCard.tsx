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
import { useLocale } from 'src/hooks/useLocale';
import { currencyFormat, percentageFormat } from 'src/lib/intlFormat';
import { useApprovedSalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';

export const SalarySummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcm, calculation } = useSalaryCalculator();
  const { data: approvedData } = useApprovedSalaryCalculationQuery();
  const locale = useLocale();
  const approvedCalculation = approvedData?.salaryRequest;

  const formatCurrency = (value: number | null | undefined) =>
    currencyFormat(value ?? 0, 'USD', locale, {
      fractionDigits: 2,
      showTrailingZeros: true,
    });

  const formatPercentage = (value: number | null | undefined) =>
    percentageFormat((value ?? 0) / 100, locale, { fractionDigits: 2 });

  const [self, spouse] = hcm ?? [];
  const name = self?.staffInfo.firstName;
  const spouseName = spouse?.staffInfo.firstName;

  return (
    <StepCard
      sx={{
        '.MuiTableCell-head.MuiTableCell-root': {
          // Make sure that both table's headers line up
          width: '25%',
        },
      }}
    >
      <CardHeader title={t('New Salary Calculation Summary')} />
      <CardContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{name}</TableCell>
              <TableCell scope="col">{t('Old')}</TableCell>
              <TableCell scope="col">{t('New')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">{t('Requested Salary')}</TableCell>
              <TableCell>
                {formatCurrency(approvedCalculation?.salary)}
              </TableCell>
              <TableCell>{formatCurrency(calculation?.salary)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('MHA')}</TableCell>
              <TableCell>
                {formatCurrency(approvedCalculation?.mhaAmount)}
              </TableCell>
              <TableCell>{formatCurrency(calculation?.mhaAmount)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('403(b) Contribution')}</TableCell>
              <TableCell>
                {formatPercentage(
                  (self?.fourOThreeB
                    ?.currentTaxDeferredContributionPercentage ?? 0) +
                    (self?.fourOThreeB?.currentRothContributionPercentage ?? 0),
                )}
              </TableCell>
              <TableCell>
                {formatPercentage(
                  (self?.fourOThreeB
                    ?.currentTaxDeferredContributionPercentage ?? 0) +
                    (self?.fourOThreeB?.currentRothContributionPercentage ?? 0),
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell scope="row">{t('Max Allowable Salary')}</TableCell>
              <TableCell>
                {formatCurrency(approvedCalculation?.salaryCap)}
              </TableCell>
              <TableCell>{formatCurrency(calculation?.salaryCap)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {spouse && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell scope="col">{spouseName}</TableCell>
                <TableCell scope="col">{t('Old')}</TableCell>
                <TableCell scope="col">{t('New')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell scope="row">{t('Requested Salary')}</TableCell>
                <TableCell>
                  {formatCurrency(approvedCalculation?.spouseSalary)}
                </TableCell>
                <TableCell>
                  {formatCurrency(calculation?.spouseSalary)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">{t('MHA')}</TableCell>
                <TableCell>
                  {formatCurrency(approvedCalculation?.spouseMhaAmount)}
                </TableCell>
                <TableCell>
                  {formatCurrency(calculation?.spouseMhaAmount)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">{t('403(b) Contribution')}</TableCell>
                <TableCell>
                  {formatPercentage(
                    (spouse.fourOThreeB
                      ?.currentTaxDeferredContributionPercentage ?? 0) +
                      (spouse.fourOThreeB?.currentRothContributionPercentage ??
                        0),
                  )}
                </TableCell>
                <TableCell>
                  {formatPercentage(
                    (spouse.fourOThreeB
                      ?.currentTaxDeferredContributionPercentage ?? 0) +
                      (spouse.fourOThreeB?.currentRothContributionPercentage ??
                        0),
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell scope="row">{t('Max Allowable Salary')}</TableCell>
                <TableCell>
                  {formatCurrency(approvedCalculation?.spouseSalaryCap)}
                </TableCell>
                <TableCell>
                  {formatCurrency(calculation?.spouseSalaryCap)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </CardContent>
    </StepCard>
  );
};
