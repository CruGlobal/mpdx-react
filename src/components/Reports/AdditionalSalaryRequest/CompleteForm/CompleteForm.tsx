import React, { useMemo } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormikContext } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { NameDisplay } from 'src/components/Reports/Shared/CalculationReports/NameDisplay/NameDisplay';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getHeader } from '../Shared/Helper/getHeader';
import { fieldConfig } from '../Shared/useAdditionalSalaryRequestForm';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest/AdditionalSalaryRequest';
import { ContactInformation } from './ContactInformation/ContactInformation';
import { Deduction } from './Deduction/Deduction';
import { NetAdditionalSalary } from './NetAdditionalSalary/NetAdditionalSalary';

export const CompleteForm: React.FC = () => {
  const { t } = useTranslation();
  const { currentIndex, requestData, user } = useAdditionalSalaryRequest();
  const { submitCount, isValid, errors } =
    useFormikContext<CompleteFormValues>();

  const theme = useTheme();

  const { currentSalaryCap, staffAccountBalance } =
    requestData?.additionalSalaryRequest?.calculations || {};

  const name = user?.staffInfo?.preferredName ?? '';
  const accountNumber = user?.staffInfo?.personNumber ?? '';
  const email = user?.staffInfo?.emailAddress ?? '';

  const primaryAccountBalance = staffAccountBalance ?? 0;
  const remainingAllowableSalary =
    (currentSalaryCap ?? 0) - (staffAccountBalance ?? 0);

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
    <AdditionalSalaryRequestSection title={getHeader(currentIndex)}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(4),
        }}
      >
        <NameDisplay
          names={name}
          personNumbers={accountNumber}
          showContent={true}
          titleOne={t('Primary Account Balance')}
          amountOne={primaryAccountBalance}
          titleTwo={t('Your Remaining Allowable Salary')}
          amountTwo={remainingAllowableSalary}
        />

        <Typography variant="body1" paragraph>
          {t(
            'Please enter the desired dollar amounts for the appropriate categories and review totals before submitting. Your Net Additional Salary calculated below represents the amount you will receive (before taxes) in additional salary and equals the amount you are requesting minus any amount being contributed to your 403(b).',
          )}
        </Typography>
        <AdditionalSalaryRequest />
        <NetAdditionalSalary />
        <Deduction />
        <NetAdditionalSalary />
        <Trans t={t}>
          <Typography variant="body2" paragraph>
            <Typography fontWeight="bold" component="span" variant="body2">
              Note:{' '}
            </Typography>
            Taxes and any requested 403(b) amount will be subtracted from the
            amount of additional salary that you are requesting. The percentage
            of taxes on this request should be similar to that of your
            paychecks, but may be more if you have chosen to have an additional
            amount of withholding on your paychecks. If you have any questions
            about this, please call 1(888)278-7233 (option 2, 2)
          </Typography>
          <Typography variant="body1" paragraph>
            If the above information is correct, please confirm your telephone
            number and email address and click &quot;Submit&quot; to process
            this form.
          </Typography>
        </Trans>
        <ContactInformation email={email} />
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
      </Box>
    </AdditionalSalaryRequestSection>
  );
};
