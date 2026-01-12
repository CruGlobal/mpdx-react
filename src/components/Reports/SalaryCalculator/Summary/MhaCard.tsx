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

export const MhaCard: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse, calculation } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();

  const calcs = calculation?.calculations;
  const spouseCalcs = calculation?.spouseCalculations;
  const hasSpouse = !!hcmSpouse && !!spouseCalcs;

  return (
    <StepCard>
      <CardHeader title={t("Minister's Housing Allowance")} />
      <CardContent>
        <SummaryTable>
          <TableHead>
            <TableRow>
              <TableCell scope="col">{t('Category')}</TableCell>
              <TableCell scope="col">
                {hcmUser?.staffInfo.preferredName}
              </TableCell>
              {hasSpouse && (
                <TableCell scope="col">
                  {hcmSpouse.staffInfo.preferredName}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell scope="row">
                15. {t('Minimum Required Salary')}
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.minimumRequiredSalary)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.minimumRequiredSalary)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                16. {t('Subtotal')}
                <span className="explanation">{t('Line 12 - Line 15')}</span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.requestedAboveMinimum)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.requestedAboveMinimum)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                17. {t("Minister's Housing Allowance")}
                <span className="explanation">
                  {t(
                    'Use the lesser of line 16 or your CCC Board approved amount.',
                  )}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.requestedMha)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.requestedMha)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                18. {t('Subtotal')}
                <span className="explanation">
                  {t('Line 16 - Line 17')}
                  <br />
                  {t('Enter the greater of this amount or zero.')}
                </span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.requestedAboveMha)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.requestedAboveMha)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                19. {t('Minimum Required Salary')}
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.minimumRequiredSalary)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.minimumRequiredSalary)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                20. {t('Compensation')}
                <span className="explanation">{t('Line 18 + Line 19')}</span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.taxableCompensation)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.taxableCompensation)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                21. {t('403(b) Amount')}
                <span className="explanation">{t('Line 14 - Line 12')}</span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.contributing403bAmount)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.contributing403bAmount)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                a. {t('Tax-deferred (before tax) Amount')}
                <span className="explanation">{t('Not taxed now')}</span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.contributingTaxDeferredAmount)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.contributingTaxDeferredAmount)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                b. {t('Roth (after-tax) Amount')}
                <span className="explanation">{t('Taxed now')}</span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.contributingRothAmount)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.contributingRothAmount)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row" className="sub-item">
                c. {t('Total Amount')}
                <span className="explanation">{t('Line 21a + Line 21b')}</span>
              </TableCell>
              <TableCell>
                {formatCurrency(calcs?.contributing403bAmount)}
              </TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.contributing403bAmount)}
                </TableCell>
              )}
            </TableRow>

            <TableRow>
              <TableCell scope="row">
                22. {t('Annual Compensation Rate')}
                <span className="explanation">{t('Line 20 + Line 21c')}</span>
              </TableCell>
              <TableCell>{formatCurrency(calcs?.annualCompensation)}</TableCell>
              {hasSpouse && (
                <TableCell>
                  {formatCurrency(spouseCalcs.annualCompensation)}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </SummaryTable>
      </CardContent>
    </StepCard>
  );
};
