import React, { ReactNode } from 'react';
import { CampaignOutlined } from '@mui/icons-material';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const PageBackground = styled('div')(({ theme }) => ({
  minWidth: '100vw',
  // Compensate for varying toolbar height
  minHeight: 'calc(100vh - var(--toolbar-height))',
  '--toolbar-height': '64px',
  '@media (min-width: 0px) and (orientation: landscape)': {
    '--toolbar-height': '48px',
  },
  '@media (min-width: 600px)': {
    '--toolbar-height': '64px',
  },
  backgroundColor: theme.palette.primary.main,
  paddingTop: theme.spacing(8),
}));

const PageCard = styled(Card)(({ theme }) => ({
  marginInline: 'auto',
  maxWidth: theme.spacing(75),
}));

const PageContent = styled(CardContent)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  alignItems: 'center',
  textAlign: 'center',
}));

const StyledIcon = styled(CampaignOutlined)(({ theme }) => ({
  width: 'auto',
  height: theme.spacing(8),
  color: theme.palette.primary.main,
}));

const HeaderWrapper = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  gap: theme.spacing(1),
}));

const HeaderTypography = styled(Typography)({
  fontSize: '2.75rem',
  fontWeight: 'bold',
  flex: 1,
  textAlign: 'center',
});

interface SetupPageProps {
  title: ReactNode;
  children: ReactNode;
}

export const SetupPage: React.FC<SetupPageProps> = ({ title, children }) => (
  <PageBackground>
    <PageCard variant="outlined">
      <PageContent>
        <HeaderWrapper>
          <StyledIcon />
          <HeaderTypography variant="h2">{title}</HeaderTypography>
        </HeaderWrapper>
        <Divider sx={{ width: '100%' }} />
        {children}
      </PageContent>
    </PageCard>
  </PageBackground>
);
