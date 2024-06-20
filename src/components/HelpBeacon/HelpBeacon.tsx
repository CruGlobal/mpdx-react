import QuestionMark from '@mui/icons-material/QuestionMark';
import { styled } from '@mui/material/styles';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

const StyledLink = styled('a')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '100%',
  backgroundColor: theme.palette.mpdxBlue.main,
  ':hover': {
    backgroundColor: '#055E8B', // 10% darker
  },
  position: 'fixed',
  right: 70,
  bottom: 30,
  '@media (max-width: 900px)': {
    right: 40,
    bottom: 25,
  },
  '@media (max-width: 600px)': {
    right: 30,
    bottom: 30,
  },
  width: 60,
  height: 60,
  zIndex: 10,
}));

interface HelpBeaconProps {
  helpUrls: Record<string, string> | null;
}

export const HelpBeacon: React.FC<HelpBeaconProps> = ({ helpUrls }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { data: session } = useSession();

  const helpUrl = helpUrls?.[language] ?? helpUrls?.default;
  if (!helpUrl) {
    return null;
  }

  const url = new URL(helpUrl);
  if (session?.user.name) {
    url.searchParams.set('mpdxName', session.user.name);
  }
  if (session?.user.email) {
    url.searchParams.set('mpdxEmail', session.user.email);
  }
  if (typeof window !== 'undefined') {
    url.searchParams.set('mpdxUrl', window.location.href);
  }

  return (
    <StyledLink aria-label={t('Help')} href={url.href} target="_blank">
      <QuestionMark sx={{ color: 'white' }} />
    </StyledLink>
  );
};
