import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { NameDisplay } from '../../../Shared/CalculationReports/NameDisplay/NameDisplay';
import { mainContentWidth } from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequest } from '../../CompleteForm/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { ContactInformation } from '../../CompleteForm/ContactInformation/ContactInformation';
import { Deduction } from '../../CompleteForm/Deduction/Deduction';
import { NetAdditionalSalary } from '../../CompleteForm/NetAdditionalSalary/NetAdditionalSalary';
import { useFormData } from '../../Shared/useFormData';
import { SpouseComponent } from '../../SharedComponents/SpouseComponent';
import { ValidationAlert } from '../../SharedComponents/ValidationAlert';

export const NewForm: React.FC = () => {
  const { t } = useTranslation();
  const {
    email,
    name,
    accountNumber,
    primaryAccountBalance,
    remainingAllowableSalary,
  } = useFormData();

  return (
    <Stack gap={4} padding={4} width={mainContentWidth}>
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
        {t(
          'Please enter the desired dollar amounts for the appropriate categories and review totals before submitting. Your Net Additional Salary calculated below represents the amount you will receive (before taxes) in additional salary and equals the amount you are requesting minus any amount being contributed to your 403(b).',
        )}
      </Typography>
      <AdditionalSalaryRequest />
      <Deduction />
      <NetAdditionalSalary />
      <Trans t={t}>
        <Typography variant="body1" paragraph>
          If the above information is correct, please confirm your telephone
          number and email address and click &quot;Submit&quot; to process this
          form.
        </Typography>
      </Trans>
      <ContactInformation email={email ?? ''} />
      <ValidationAlert />
    </Stack>
  );
};
