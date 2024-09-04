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
      sx={{ marginBottom: 2 }}
    >
      {title && <Typography variant="h6">{title}</Typography>}
      {content}
    </Alert>
  );
};
