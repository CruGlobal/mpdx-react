import React, { useMemo } from 'react';
import { Alert, Stack, Typography } from '@mui/material';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
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
import { fieldConfig } from '../../Shared/useAdditionalSalaryRequestForm';
import { SpouseComponent } from '../../SharedComponents/SpouseComponent';
import { TotalAnnualSalarySummaryCard } from '../../SharedComponents/TotalAnnualSalarySummaryCard';

export const EditForm: React.FC = () => {
  const { t } = useTranslation();
  const { requestData, user } = useAdditionalSalaryRequest();
  const { currentSalaryCap, staffAccountBalance } =
    requestData?.additionalSalaryRequest?.calculations || {};
  const {
    emailAddress: email,
    preferredName: name,
    personNumber: accountNumber,
  } = user?.staffInfo || {};
  const grossSalaryAmount = user?.currentSalary?.grossSalaryAmount ?? 0;
  const primaryAccountBalance = staffAccountBalance ?? 0;
  const remainingAllowableSalary = (currentSalaryCap ?? 0) - grossSalaryAmount;
  const { submitCount, isValid, errors } =
    useFormikContext<CompleteFormValues>();
  const showAlert = !!submitCount && !isValid;

  const exceedingLimitFields = useMemo(() => {
    if (!errors || !submitCount) {
      return [];
    }

    return fieldConfig
      .filter(({ key, max }) => {
        if (!max) {
          return false;
        }
        const error = errors[key as keyof CompleteFormValues];
        return (
          typeof error === 'string' && error.toLowerCase().includes('exceeds')
        );
      })
      .map(({ label }) => t(label));
  }, [errors, submitCount, t]);

  return (
    <Stack gap={4} padding={4} width={mainContentWidth}>
      <Typography variant="h4">{t('Edit Your Request')}</Typography>
      <NameDisplay
        names={name ?? ''}
        personNumbers={accountNumber ?? ''}
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
      <ContactInformation email={email ?? ''} />
      {showAlert && (
        <Alert severity="error" sx={{ mt: 2, '& ul': { m: 0, pl: 3 } }}>
          {t('Your form is missing information.')}
          <ul>
            <li>{t('Please enter a value for all required fields.')}</li>
            {exceedingLimitFields.length > 0 && (
              <li>
                {t('The following fields exceed their limits: {{fields}}', {
                  fields: exceedingLimitFields.join(', '),
                })}
              </li>
            )}
          </ul>
        </Alert>
      )}
    </Stack>
  );
};
