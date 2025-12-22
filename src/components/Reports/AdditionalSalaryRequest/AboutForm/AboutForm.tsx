import React from 'react';
import { Link, List, ListItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Trans, useTranslation } from 'react-i18next';
import { NameDisplay } from '../../Shared/CalculationReports/NameDisplay/NameDisplay';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { getHeader } from '../Shared/Helper/getHeader';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import { SpouseComponent } from '../SharedComponents/SpouseComponent';

export const AboutForm: React.FC = () => {
  const { currentStep, hcmUser } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const theme = useTheme();

  const { staffInfo } = hcmUser || {};

  // TODO: Replace with actual data from API/context
  const name = staffInfo?.preferredName ?? '';
  const accountNumber = staffInfo?.personNumber ?? '';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  return (
    <AdditionalSalaryRequestSection title={getHeader(t, currentStep)}>
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
    </AdditionalSalaryRequestSection>
  );
};
