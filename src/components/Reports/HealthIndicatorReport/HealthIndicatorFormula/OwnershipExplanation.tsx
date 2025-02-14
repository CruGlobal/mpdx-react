import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const OwnershipExplanation: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Typography>
        {t(
          'This indicator helps you understand the proportion of your support that comes from your own efforts versus what has been provided through funds given to you. Self-raised funds are those you receive based on your own initiative, rather than from national subsidies or matching funds, or financial help from the National (Global) ministry.',
        )}
      </Typography>
      <Typography>
        {t(
          'A higher score on this indicator signifies that you have ownership of your Ministry Partner Development (MPD) and suggests a healthy financial situation.',
        )}
      </Typography>
      <Typography>
        {t(
          'In most cases, this indicator will score 100 points; however, it may be lower in some situations. The recommendation is that it should not drop below 70. In some ministries, especially for new staff, initial funding is provided to help them during the first few years, but this financial subsidy decreases each year.',
        )}
      </Typography>
      <Typography variant="h5">{t('Tips to Improve:')}</Typography>
      <ul>
        <Typography component="li">{t('For New Staff:')}</Typography>
        <ul>
          <Typography component="li">
            {t(
              "Set your support goals without considering the subsidy. Don't limit yourself! During the first few years, you often have a larger contact base from friends, family, and your church community.",
            )}
          </Typography>
        </ul>
        <Typography component="li">{t('For Senior Staff:')}</Typography>
        <ul>
          <Typography component="li">
            {t(
              'If your indicator is not already at 100, consider dedicating some intensive time to MPD.',
            )}
          </Typography>
        </ul>
      </ul>
      <Typography>
        {t(
          "Remember, our mission's success is not only our responsibility; we are working together with a team of ministry partners. The Great Commission is something we accomplish collectively as the body of Christ.",
        )}
      </Typography>
    </>
  );
};
