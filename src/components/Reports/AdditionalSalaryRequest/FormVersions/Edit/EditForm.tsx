import NextLink from 'next/link';
import { Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NameDisplay } from '../../../Shared/CalculationReports/NameDisplay/NameDisplay';
import { mainContentWidth } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequest } from '../../CompleteForm/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { ContactInformation } from '../../CompleteForm/ContactInformation/ContactInformation';
import { Deduction } from '../../CompleteForm/Deduction/Deduction';
import { NetAdditionalSalary } from '../../CompleteForm/NetAdditionalSalary/NetAdditionalSalary';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { SpouseComponent } from '../../SharedComponents/SpouseComponent';
import { TotalAnnualSalarySummaryCard } from '../../SharedComponents/TotalAnnualSalarySummaryCard';

export const EditForm: React.FC = () => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const { requestData, user } = useAdditionalSalaryRequest();
  const { currentSalaryCap, staffAccountBalance } =
    requestData?.additionalSalaryRequest?.calculations || {};
  const email = user?.staffInfo?.emailAddress ?? '';
  const name = user?.staffInfo?.preferredName ?? '';
  const accountNumber = user?.staffInfo?.personNumber ?? '';
  const primaryAccountBalance = staffAccountBalance ?? 0;
  const remainingAllowableSalary =
    (currentSalaryCap ?? 0) - (staffAccountBalance ?? 0);

  return (
    <Stack gap={4} padding={4} width={mainContentWidth}>
      <Typography variant="h4">{t('Edit Your Request')}</Typography>
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
      <Typography variant="body1" paragraph>
        {t(
          'Please enter the desired dollar amounts for the appropriate categories and review totals before submitting. Your Net Additional Salary calculated below represents the amount you will receive as an additional salary check (before taxes) and is equal to the amount you are requesting minus any amount being contributed to your 403(b).',
        )}
      </Typography>
      <AdditionalSalaryRequest />
      <Deduction />
      <NetAdditionalSalary />
      <TotalAnnualSalarySummaryCard />
      <Typography variant="body1" paragraph>
        {t(
          'If the above information is correct, please confirm your telephone number and email address and click "Submit" to process this form.',
        )}
      </Typography>
      <ContactInformation email={email} />
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
