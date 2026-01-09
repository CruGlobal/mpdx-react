import NextLink from 'next/link';
import { Link, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { MhaCard } from './MhaCard';
import { SalaryCalculationCard } from './SalaryCalculationCard';
import { SalaryCapCard } from './SalaryCapCard';
import { SalarySummaryCard } from './SalarySummaryCard';
import { StaffInfoSummaryCard } from './StaffInfoSummaryCard';

export const SummaryStep: React.FC = () => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  return (
    <Stack gap={4} padding={4}>
      <Typography variant="h4">{t('Summary')}</Typography>
      <Trans t={t}>
        <Typography variant="body1">
          Please review the detailed summary of the salary you are requesting
          below. If it is correct, click the &quot;Submit&quot; button on the
          bottom of his page. You may make changes to some of the fields by
          selecting the section you would like to return to in the menu to the
          left.
        </Typography>

        <Typography variant="body1">
          As you review the information here, please take note: Staff members
          are paid individually according to the amount that is requested within
          policy. If you are married, as you set your salary levels, the amount
          each spouse receives should reflect the amount of time each works in
          ministry. To submit online your Gross Salary (line 14), which includes
          403(b) and (if applicable) Social Security, may not exceed your
          Maximum Allowable Salary (CAP-Line 9). For approved expenses,
          additional salary may be requested by using the{' '}
          <Link
            component={NextLink}
            href={`/accountLists/${accountListId}/reports/additionalSalaryRequest`}
          >
            Additional Salary Request Form
          </Link>
          .
        </Typography>
      </Trans>
      <SalarySummaryCard />
      <StaffInfoSummaryCard />
      <SalaryCapCard />
      <SalaryCalculationCard />
      <MhaCard />
    </Stack>
  );
};
