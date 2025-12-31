import React from 'react';
import { Close } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';
import theme from 'src/theme';

const StyledBanner = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: navBarHeight,
  left: 0,
  right: 0,
  width: '100%',
  zIndex: 1000,
  borderRadius: 0,
  boxShadow: `0px 0px 10px 0px ${
    theme.palette.augmentColor({
      color: { main: theme.palette.cruGrayDark.main },
    }).light
  }`,
  background: theme.palette.secondary.main,
  color: theme.palette.text.primary,
  padding: `${theme.spacing(1)} ${theme.spacing(1)}`,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

interface EffectiveDateBannerProps {
  onClose: () => void;
}

export const EffectiveDateBanner: React.FC<EffectiveDateBannerProps> = ({
  onClose,
}) => {
  const { t } = useTranslation();
  const thisYear = DateTime.now().year;
  const nextYear = thisYear + 1;

  return (
    <StyledBanner>
      <Typography
        data-testid="effective-date-banner-text"
        variant="body1"
        sx={{ textAlign: 'center', flex: 1, fontWeight: 'bold' }}
      >
        {t(
          `Dates for ${nextYear} are unavailable at this time while we update salary level tables. ` +
            `By December 15, ${thisYear} you will be able to request a salary change for ${nextYear}.`,
        )}
      </Typography>
      <IconButton
        size="small"
        onClick={onClose}
        sx={{ color: theme.palette.text.primary }}
      >
        <Close />
      </IconButton>
    </StyledBanner>
  );
};
