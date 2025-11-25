import React from 'react';
import { Box, Link, List, ListItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import { CancelButton, ContinueButton } from '../SharedComponents/NavButtons';
import { AccountInfoCard } from './AccountInfoCard';

export const AboutForm: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const theme = useTheme();

  // TODO: Replace with actual data from API/context
  const name = 'Doc, John';
  const accountNumber = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  return (
    <AdditionalSalaryRequestSection title={selectedSection.title}>
      <Trans t={t}>
        <Typography variant="body1" paragraph>
          You can use this form to electronically submit additional salary
          requests. Please note:
        </Typography>

        <List
          sx={{
            mb: theme.spacing(2),
            listStyleType: 'disc',
            pl: theme.spacing(2),
          }}
        >
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body1">
              You must have{' '}
              <Typography component="span" fontWeight="bold">
                adequate funds
              </Typography>{' '}
              in your account to cover this request.
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', pl: 0 }}>
            <Typography variant="body1">
              Your request will be reviewed and if approved, your request for
              this year{' '}
              <Typography component="span" fontWeight="bold">
                will not exceed your Remaining Allowable Salary
              </Typography>
              .
            </Typography>
          </ListItem>
        </List>
      </Trans>

      <Trans t={t}>
        <Typography variant="body1" paragraph>
          In special cases where requests exceed the remaining allowable salary,
          we require additional review through our{' '}
          <Link
            href="#"
            underline="always"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement Progressive Approvals navigation/modal
            }}
          >
            Progressive Approvals
          </Link>{' '}
          process. Depending on the request, this can take up to 14 days.
        </Typography>

        <Typography variant="body1" paragraph>
          Alternatively, you may download and submit the{' '}
          <Link
            href="#"
            underline="always"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement paper version download
            }}
          >
            paper version
          </Link>{' '}
          of the Additional Salary request if you prefer.
        </Typography>
      </Trans>

      <AccountInfoCard
        name={name}
        accountNumber={accountNumber}
        primaryAccountBalance={primaryAccountBalance}
        remainingAllowableSalary={remainingAllowableSalary}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: theme.spacing(4),
        }}
      >
        <CancelButton />
        <ContinueButton />
      </Box>
    </AdditionalSalaryRequestSection>
  );
};
