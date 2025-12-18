import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import { NameDisplay } from 'src/components/Reports/Shared/CalculationReports/NameDisplay/NameDisplay';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getHeader } from '../Shared/Helper/getHeader';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest/AdditionalSalaryRequest';
import { ContactInformation } from './ContactInformation/ContactInformation';
import { Deduction } from './Deduction/Deduction';
import { NetAdditionalSalary } from './NetAdditionalSalary/NetAdditionalSalary';

export const CompleteForm: React.FC = () => {
  const { t } = useTranslation();
  const { currentIndex } = useAdditionalSalaryRequest();

  const theme = useTheme();
  const name = 'Doc, John';
  const accountNumber = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  return (
    <AdditionalSalaryRequestSection title={getHeader(t, currentIndex)}>
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
        <ContactInformation />
      </Box>
    </AdditionalSalaryRequestSection>
  );
};
