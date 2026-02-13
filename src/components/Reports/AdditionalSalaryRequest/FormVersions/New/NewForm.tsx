import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { NameDisplay } from '../../../Shared/CalculationReports/NameDisplay/NameDisplay';
import {
  CompleteFormValues,
  mainContentWidth,
} from '../../AdditionalSalaryRequest';
import { AdditionalSalaryRequest } from '../../CompleteForm/AdditionalSalaryRequest/AdditionalSalaryRequest';
import { ContactInformation } from '../../CompleteForm/ContactInformation/ContactInformation';
import { Deduction } from '../../CompleteForm/Deduction/Deduction';
import { NetAdditionalSalary } from '../../CompleteForm/NetAdditionalSalary/NetAdditionalSalary';
import { useAdditionalSalaryRequest } from '../../Shared/AdditionalSalaryRequestContext';
import { useFormUserInfo } from '../../Shared/useFormUserInfo';
import { useSalaryCalculations } from '../../Shared/useSalaryCalculations';
import { SpouseComponent } from '../../SharedComponents/SpouseComponent';
import { ValidationAlert } from '../../SharedComponents/ValidationAlert';
import { ApprovalProcess } from '../../SubmitModalAccordions/ApprovalProcess/ApprovalProcess';
import { TotalSalaryRequested } from '../../SubmitModalAccordions/TotalSalaryRequested/TotalSalaryRequested';

export const NewForm: React.FC = () => {
  const { t } = useTranslation();
  const { requestData } = useAdditionalSalaryRequest();
  const { values } = useFormikContext<CompleteFormValues>();
  const { name, accountNumber, primaryAccountBalance } = useFormUserInfo();
  const individualCap =
    requestData?.latestAdditionalSalaryRequest?.calculations.currentSalaryCap ??
    5000;

  const { exceedsCap } = useSalaryCalculations({
    values,
  });

  return (
    <Stack gap={4} padding={4} width={mainContentWidth}>
      <Typography variant="h4">{t('Complete the Form')}</Typography>
      <NameDisplay
        names={name ?? ''}
        personNumbers={accountNumber ?? ''}
        titleOne={t('Primary Account Balance')}
        amountOne={primaryAccountBalance}
        titleTwo={t('Your Remaining Allowable Salary')}
        amountTwo={individualCap}
        spouseComponent={<SpouseComponent />}
        showContent
      />

      <Typography variant="body1" paragraph>
        <Trans t={t}>
          Please enter the desired dollar amounts for the appropriate categories
          and review totals before submitting. Your Net Additional Salary
          calculated below represents the amount you will receive as an
          additional salary check (before taxes) and is equal to the amount you
          are requesting minus any amount being contributed to your 403(b).
        </Trans>
      </Typography>
      <AdditionalSalaryRequest />
      <Deduction />
      <NetAdditionalSalary />
      {exceedsCap && (
        <>
          <TotalSalaryRequested onForm />
          <ApprovalProcess onForm />
        </>
      )}
      <Typography variant="body1" paragraph>
        <Trans t={t}>
          If the above information is correct, please confirm your telephone
          number and email address and click &quot;Submit&quot; to process this
          form.
        </Trans>
      </Typography>
      <ContactInformation />
      <ValidationAlert />
    </Stack>
  );
};
