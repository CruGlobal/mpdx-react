import Link from 'next/link';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const SuccessExplanation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>
        {t(
          'Setting a financial support goal is crucial for every staff member to be effective in the field. Understanding and planning our financial needs helps ensure that everyone can succeed in their roles. Establishing a realistic support goal is key to effective ministry, as it ensures that our families are financially supported.',
        )}
      </Typography>
      <Typography>
        {t(
          'The success indicator allows us to assess our effectiveness in reaching our current support goal.',
        )}
      </Typography>
      <Typography fontWeight="bold">
        {t('Definition of 100% Staff Support:')}
      </Typography>
      <Typography>
        {t(
          'The sum of Full Salary + Allowances + Reimbursements + Benefits + Administration Charge + Attrition.',
        )}
      </Typography>
      <Typography fontWeight="bold">{t('Note:')}</Typography>
      <Typography>
        {t(
          'If you do not have a staff support goal set up in NetSuite, the automation calculation is as follows: All your salary expenses for the previous 12 months are multiplied by 1.6. This 1.6 multiplier is designed to ensure that you have enough resources to cover your salary and salary-related expenses, as well as some of your personal ministry expenses.',
        )}
      </Typography>
      <Typography>
        {t(
          'The desired Health score is always 100, meaning that you are fully funded!',
        )}
      </Typography>
      <Typography>
        {t(
          'If your MPD Success Health score is under 70, consider dedicating some intensive time to MPD.',
        )}
      </Typography>
      <Typography variant="h5">{t('Tips to Improve:')}</Typography>
      <ul>
        <Typography component="li">
          {t(
            'Follow up with your partners if they have made a commitment that has not yet been received in your account.',
          )}
        </Typography>
        <Typography component="li">
          {t('Take time at least once a month to review your donations.')}
        </Typography>
        <Typography component="li">
          {t(
            'Maintain monthly or bi-monthly connections with your partners. For assistance with effective and time-efficient ideas, please visit the Global Staff Web',
          )}{' '}
          (
          <Link href="https://www.globalstaffweb.org/languages/en/partner-development.html">
            {t('Global Partner Development Section')}
          </Link>
          ).
        </Typography>
        <Typography component="li">
          {t('Review your Staff Support Goal and update it as necessary.')}
        </Typography>
      </ul>
    </>
  );
};
