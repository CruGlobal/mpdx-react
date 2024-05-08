import QuestionMark from '@mui/icons-material/QuestionMark';
import { styled } from '@mui/material/styles';
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
    backgroundColor: 'green',
  },
  '@media (max-width: 600px)': {
    right: 30,
    bottom: 30,
    backgroundColor: 'red',
  },
  width: 60,
  height: 60,
  zIndex: 10,
}));

interface HelpBeaconProps {
  helpUrl: string;
}

export const HelpBeacon: React.FC<HelpBeaconProps> = ({ helpUrl }) => {
  const { t } = useTranslation();

  return (
    <StyledLink aria-label={t('Help')} href={helpUrl} target="_blank">
      <QuestionMark sx={{ color: 'white' }} />
    </StyledLink>
  );
};
