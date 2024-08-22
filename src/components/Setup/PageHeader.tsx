import { CampaignOutlined } from '@mui/icons-material';
import { Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledIcon = styled(CampaignOutlined)(({ theme }) => ({
  width: 'auto',
  height: theme.spacing(8),
}));

const Wrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledTypography = styled(Typography)({ fontWeight: 'bold' });

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => (
  <>
    <Wrapper>
      <StyledIcon />
      <StyledTypography variant="h2">{title}</StyledTypography>
    </Wrapper>
    <Divider sx={{ width: '100%' }} />
  </>
);
