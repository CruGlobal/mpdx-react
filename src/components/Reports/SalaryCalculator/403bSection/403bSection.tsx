import React from 'react';
import {
  CardContent,
  CardHeader,
  Link,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { Stack } from '@mui/system';
import { Trans, useTranslation } from 'react-i18next';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import {
  FormattedTableCell,
  StepCard,
  StepTableHead,
} from '../Shared/StepCard';

export const FourOhThreeBSection: React.FC = () => {
  const { t } = useTranslation();
  const { hcmUser, hcmSpouse } = useSalaryCalculator();

  const user = hcmUser?.fourOThreeB;
  const spouse = hcmSpouse?.fourOThreeB;

  return (
    <Stack gap={4}>
      <StepCard>
        <CardHeader title={t('403(b) Retirement Contribution')} />
        <CardContent>
          <Typography variant="body1">
            <Trans t={t}>
              Please review your current contribution elections below. If you
              would like to make changes you may do so by logging into your{' '}
              <Link
                href="https://www.principal.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Principal
              </Link>{' '}
              account. Please wait to complete your Salary Calculation Form
              until those changes are reflected here.
            </Trans>
          </Typography>

          <Table>
            <StepTableHead />
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  {t('Current Tax-Deferred Contribution Percent')}
                </TableCell>
                <FormattedTableCell
                  percentage
                  value={user?.currentTaxDeferredContributionPercentage}
                />
                {spouse && (
                  <FormattedTableCell
                    percentage
                    value={spouse.currentTaxDeferredContributionPercentage}
                  />
                )}
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  {t('Current Roth 403(b) Contribution Percent')}
                </TableCell>
                <FormattedTableCell
                  percentage
                  value={user?.currentRothContributionPercentage}
                />
                {spouse && (
                  <FormattedTableCell
                    percentage
                    value={spouse.currentRothContributionPercentage}
                  />
                )}
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  {t('Maximum Contribution Limit')}
                </TableCell>
                <FormattedTableCell value={user?.maximumContributionLimit} />
                {spouse && (
                  <FormattedTableCell value={spouse.maximumContributionLimit} />
                )}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </StepCard>
    </Stack>
  );
};
