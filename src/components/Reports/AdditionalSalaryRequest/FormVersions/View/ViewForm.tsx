import NextLink from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NameDisplay } from '../../../Shared/CalculationReports/NameDisplay/NameDisplay';
import { mainContentWidth } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequest } from '../../CompleteForm/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { Deduction } from '../../CompleteForm/Deduction/Deduction';
import { NetAdditionalSalary } from '../../CompleteForm/NetAdditionalSalary/NetAdditionalSalary';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useFormData } from '../../Shared/useFormData';
import { ContactInformationSummaryCard } from '../../SharedComponents/ContactInformationSummaryCard';
import { SpouseComponent } from '../../SharedComponents/SpouseComponent';
import { ApprovalProcess } from '../../SubmitModalAccordions/ApprovalProcess/ApprovalProcess';
import { TotalAnnualSalary } from '../../SubmitModalAccordions/TotalAnnualSalary/TotalAnnualSalary';

export const ViewForm: React.FC = () => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const { exceedsCap } = useAdditionalSalaryRequest();
  const {
    name,
    accountNumber,
    primaryAccountBalance,
    remainingAllowableSalary,
  } = useFormData();

  return (
    <Stack gap={4} padding={4} width={mainContentWidth}>
      <Typography variant="h4">{t('View Your Request')}</Typography>
      <NameDisplay
        names={name ?? ''}
        personNumbers={accountNumber ?? ''}
        titleOne={t('Primary Account Balance')}
        amountOne={primaryAccountBalance}
        titleTwo={t('Your Remaining Allowable Salary')}
        amountTwo={remainingAllowableSalary}
        spouseComponent={<SpouseComponent />}
        showContent
      />
      <Typography variant="body1" paragraph>
        <Trans t={t}>
          Your Net Additional Salary calculated below represents the amount you
          will receive as an additional salary check (before taxes) and is equal
          to the amount you are requesting minus any amount being contributed to
          your 403(b).
        </Trans>
      </Typography>
      <AdditionalSalaryRequest />
      <Deduction />
      <NetAdditionalSalary />
      <ContactInformationSummaryCard />
      {exceedsCap && (
        <>
          <TotalAnnualSalary onForm={true} />
          <ApprovalProcess onForm={true} />
        </>
      )}

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
