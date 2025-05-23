import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const DepthExplanation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>
        {t(
          "The Depth MPD Health Indicator is designed to evaluate the number of local partners involved in your ministry. Regardless of where you serve in the world, there are local believers around you, or by God's grace, there will be local believers as a result of your ministry efforts.",
        )}
      </Typography>
      <Typography>
        {t(
          'You will receive 100 points if more than 70% of your partners are locally based, or if there has been an increase of more than 5% in local partners over the last 14 months. You will earn 50 points if there is an increase of up to 5% in the number of local partners during that same timeframe.',
        )}
      </Typography>
      <Typography variant="h5">{t('Tips to Improve:')}</Typography>
      <ul>
        <Typography component="li">
          {t(
            'Throughout the year, add potential local contacts to your MPD database and reach out to them to join you.',
          )}
        </Typography>
        <Typography component="li">
          {t(
            'Be intentional and consistent in sharing what God is doing in your ministry, as His work can inspire people to get involved.',
          )}
        </Typography>
      </ul>
    </>
  );
};
