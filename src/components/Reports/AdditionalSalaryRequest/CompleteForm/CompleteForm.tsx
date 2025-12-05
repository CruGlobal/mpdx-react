import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { NameDisplay } from 'src/components/Reports/Shared/CalculationReports/NameDisplay/NameDisplay';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getHeader } from '../Shared/Helper/getHeader';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest/AdditionalSalaryRequest';
import { Deduction } from './Deduction/Deduction';
import { NetAdditionalSalary } from './NetAdditionalSalary/NetAdditionalSalary';

export const CompleteForm: React.FC = () => {
  const { t } = useTranslation();
  const { currentStep } = useAdditionalSalaryRequest();

  const theme = useTheme();
  const name = 'Doc, John';
  const accountNumber = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  return (
    <AdditionalSalaryRequestSection title={getHeader(t, currentStep)}>
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
        <Deduction />
        <NetAdditionalSalary />
      </Box>
    </AdditionalSalaryRequestSection>
  );
};
