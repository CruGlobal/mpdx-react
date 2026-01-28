import NextLink from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NameDisplay } from '../../Shared/CalculationReports/NameDisplay/NameDisplay';
import { mainContentWidth } from '../AdditionalSalaryRequest';
import { AdditionalSalaryRequest } from '../CompleteForm/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { Deduction } from '../CompleteForm/Deduction/Deduction';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { ContactInformationSummaryCard } from '../SharedComponents/ContactInformationSummaryCard';
import { SpouseComponent } from '../SharedComponents/SpouseComponent';
import { TotalAnnualSalarySummaryCard } from '../SharedComponents/TotalAnnualSalarySummaryCard';
import { NetAdditionalSalarySummaryCard } from './NetAdditionalSalarySummaryCard';

export const Summary: React.FC = () => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const { requestData, user } = useAdditionalSalaryRequest();
  const { currentSalaryCap, staffAccountBalance } =
    requestData?.additionalSalaryRequest?.calculations || {};

  const name = user?.staffInfo?.preferredName ?? '';
  const accountNumber = user?.staffInfo?.personNumber ?? '';
  const primaryAccountBalance = staffAccountBalance ?? 0;
  const remainingAllowableSalary =
    (currentSalaryCap ?? 0) - (staffAccountBalance ?? 0);

  return (
    <Stack gap={4} padding={4} width={mainContentWidth}>
      <Typography variant="h4">{t('View Your Request')}</Typography>
      <NameDisplay
        names={name}
        personNumbers={accountNumber}
        showContent={true}
        titleOne={t('Primary Account Balance')}
        amountOne={primaryAccountBalance}
        titleTwo={t('Your Remaining Allowable Salary')}
        amountTwo={remainingAllowableSalary}
        spouseComponent={<SpouseComponent />}
      />
      <Trans t={t}>
        <Typography variant="body1" paragraph>
          Your Net Additional Salary calculated below represents the amount you
          will receive as an additional salary check (before taxes) and is equal
          to the amount you are requesting minus any amount being contributed to
          your 403(b).
        </Typography>
      </Trans>
      <AdditionalSalaryRequest />
      <Deduction />
      <NetAdditionalSalarySummaryCard />
      <ContactInformationSummaryCard />
      <TotalAnnualSalarySummaryCard />

      <Button
        component={NextLink}
        href={`/accountLists/${accountListId}/reports/additionalSalaryRequest`}
        variant="contained"
        sx={{ alignSelf: 'flex-end' }}
      >
        {t('Back to Status')}
      </Button>
    </Stack>
  );
};
