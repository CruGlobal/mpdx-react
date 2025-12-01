import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { AccountInfoCard } from '../Shared/AccountInfoCard';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import {
  BackButton,
  CancelButton,
  SubmitButton,
} from '../SharedComponents/NavButtons';
import { AdditionalSalaryRequest } from './AdditionalSalaryRequest/AdditionalSalaryRequest';
import { Deduction } from './Deduction/Deduction';

export interface CompleteFormValues {
  currentYearSalary: string;
  previousYearSalary: string;
  additionalSalary: string;
  adoption: string;
  contribution403b: string;
  counseling: string;
  healthcareExpenses: string;
  babysitting: string;
  childrenMinistryTrip: string;
  childrenCollege: string;
  movingExpense: string;
  seminary: string;
  housingDownPayment: string;
  autoPurchase: string;
  reimbursableExpenses: string;
  defaultPercentage: boolean;
}

export const CompleteForm: React.FC = () => {
  const { t } = useTranslation();
  const { selectedSection } = useAdditionalSalaryRequest();
  const { handleSubmit } = useFormikContext<CompleteFormValues>();
  const theme = useTheme();
  const name = 'Doc, John';
  const accountNumber = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  return (
    <AdditionalSalaryRequestSection title={selectedSection.title}>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(4),
          }}
        >
          <AccountInfoCard
            name={name}
            accountNumber={accountNumber}
            primaryAccountBalance={primaryAccountBalance}
            remainingAllowableSalary={remainingAllowableSalary}
          />
          <Typography variant="body1" paragraph>
            {t(
              'Please enter the desired dollar amounts for the appropriate categories and review totals before submitting. Your Net Additional Salary calculated below represents the amount you will receive (before taxes) in additional salary and equals the amount you are requesting minus any amount being contributed to your 403(b).',
            )}
          </Typography>
          <AdditionalSalaryRequest />
          <Deduction />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <CancelButton />
            <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
              <BackButton />
              <SubmitButton />
            </Box>
          </Box>
        </Box>
      </form>
    </AdditionalSalaryRequestSection>
  );
};
