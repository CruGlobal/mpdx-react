import React from 'react';
import { Link, List, ListItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { AdditionalSalaryRequestSection } from '../SharedComponents/AdditionalSalaryRequestSection';
import { AccountInfoCard } from './AccountInfoCard';

export const AboutForm: React.FC = () => {
  const { selectedSection } = useAdditionalSalaryRequest();
  const { t } = useTranslation();
  const theme = useTheme();

  // TODO: Replace with actual data from API/context
  const userName = 'Doc, John';
  const userCode = '00123456';
  const primaryAccountBalance = 20307.58;
  const remainingAllowableSalary = 17500.0;

  return (
    <AdditionalSalaryRequestSection title={selectedSection.title}>
      <Typography variant="body1" paragraph>
        {t(
          'You can use this form to electronically submit additional salary requests. Please note:',
        )}
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
            {t('You must have')}{' '}
            <Typography component="span" fontWeight="bold">
              {t('adequate funds')}
            </Typography>{' '}
            {t('in your account to cover this request.')}
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item', pl: 0 }}>
          <Typography variant="body1">
            {t(
              'Your request will be reviewed and if approved, your request for this year',
            )}{' '}
            <Typography component="span" fontWeight="bold">
              {t('will not exceed your Remaining Allowable Salary')}
            </Typography>
            .
          </Typography>
        </ListItem>
      </List>

      <Typography variant="body1" paragraph>
        {t(
          'In special cases where requests exceed the remaining allowable salary, we require additional review through our',
        )}{' '}
        <Link
          href="#"
          underline="always"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement Progressive Approvals navigation/modal
          }}
        >
          {t('Progressive Approvals')}
        </Link>{' '}
        {t('process. Depending on the request, this can take up to 14 days.')}
      </Typography>

      <Typography variant="body1" paragraph>
        {t('Alternatively, you may download and submit the')}{' '}
        <Link
          href="#"
          underline="always"
          onClick={(e) => {
            e.preventDefault();
            // TODO: Implement paper version download
          }}
        >
          {t('paper version')}
        </Link>{' '}
        {t('of the Additional Salary request if you prefer.')}
      </Typography>

      <AccountInfoCard
        userName={userName}
        userCode={userCode}
        primaryAccountBalance={primaryAccountBalance}
        remainingAllowableSalary={remainingAllowableSalary}
      />
    </AdditionalSalaryRequestSection>
  );
};
