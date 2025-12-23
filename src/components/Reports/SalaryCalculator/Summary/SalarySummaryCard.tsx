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
import { useApprovedSalaryCalculationQuery } from '../SalaryCalculatorContext/SalaryCalculation.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { StepCard } from '../Shared/StepCard';
import { useFormatters } from './useFormatters';

export const SalarySummaryCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { data: approvedData } = useApprovedSalaryCalculationQuery();
  const approvedCalculation = approvedData?.salaryRequest;
  const { formatCurrency, formatPercentage } = useFormatters();

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
              <TableCell scope="col">{hcmUser?.staffInfo.firstName}</TableCell>
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
                  (hcmUser?.fourOThreeB
                    ?.currentTaxDeferredContributionPercentage ?? 0) +
                    (hcmUser?.fourOThreeB?.currentRothContributionPercentage ??
                      0),
                )}
              </TableCell>
              <TableCell>
                {formatPercentage(
                  (hcmUser?.fourOThreeB
                    ?.currentTaxDeferredContributionPercentage ?? 0) +
                    (hcmUser?.fourOThreeB?.currentRothContributionPercentage ??
                      0),
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

        {hcmSpouse && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell scope="col">
                  {hcmSpouse?.staffInfo.firstName}
                </TableCell>
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
                    (hcmSpouse.fourOThreeB
                      ?.currentTaxDeferredContributionPercentage ?? 0) +
                      (hcmSpouse.fourOThreeB
                        ?.currentRothContributionPercentage ?? 0),
                  )}
                </TableCell>
                <TableCell>
                  {formatPercentage(
                    (hcmSpouse.fourOThreeB
                      ?.currentTaxDeferredContributionPercentage ?? 0) +
                      (hcmSpouse.fourOThreeB
                        ?.currentRothContributionPercentage ?? 0),
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
