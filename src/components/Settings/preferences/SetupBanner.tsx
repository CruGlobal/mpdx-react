import CampaignIcon from '@mui/icons-material/Campaign';
import { Alert, Typography } from '@mui/material';

interface SetupBannerProps {
  button?: React.ReactNode;
  content?: React.ReactNode;
  title?: string;
}

export const SetupBanner: React.FC<SetupBannerProps> = ({
  button,
  content,
  title,
}) => {
  return (
    <Alert
      severity="info"
      icon={<CampaignIcon fontSize="large" />}
      action={button}
      sx={{
        marginBottom: 2,
        // On phones, move the button below the text instead of squeezing it
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        '& .MuiAlert-message': { flex: { xs: '1 1 0', sm: '0 1 auto' } },
        '& .MuiAlert-action': {
          flexBasis: { xs: '100%', sm: 'auto' },
          justifyContent: 'flex-end',
        },
        '& .MuiAlert-action button': { whiteSpace: 'nowrap' },
      }}
    >
      {title && <Typography variant="h6">{title}</Typography>}
      {content}
    </Alert>
  );
};
