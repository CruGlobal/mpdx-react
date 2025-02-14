import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const ConsistencyExplanation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>
        {t(
          'This health indicator helps you understand the stability of your staff balance over a period of 12 months. It relates the months when your staff account balance was positive to the months when it was negative. If the consistency health score is 75, it indicates that you have experienced a negative balance for 3 months within the last 12-month period. This is not a healthy practice!',
        )}
      </Typography>
      <Typography fontWeight="bold">{t('Note:')}</Typography>
      <Typography>
        {t(
          'Depending on your national financial policy, you may have a positive account balance but if that is lower than the national approved level for a healthy balance it is considered unhealthy.',
        )}
      </Typography>
      <Typography variant="h5">{t('Tips to Improve:')}</Typography>
      <ul>
        <Typography component="li">
          {t(
            'Review the accuracy of your support goal, as it appears you may be spending more than planned.',
          )}
        </Typography>
        <Typography component="li">
          {t(
            'Review your monthly contributions and contact your partners if they missed a donation.',
          )}
        </Typography>
        <Typography component="li">
          {t(
            'Examine your transactions to check for any charges related to future expense periods that could temporarily put your balance in deficit (for example, paying rent in advance for 2 months or similar).',
          )}
        </Typography>
        <Typography component="li">
          {t(
            'Consider scheduling time for MPD in the coming months to prevent inadequate funds and a negative balance.',
          )}
        </Typography>
      </ul>
    </>
  );
};
