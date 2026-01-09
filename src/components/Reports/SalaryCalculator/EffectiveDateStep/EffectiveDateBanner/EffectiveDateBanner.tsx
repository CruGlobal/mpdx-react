import React from 'react';
import { Alert, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import { Trans } from 'react-i18next';
import { navBarHeight } from 'src/components/Layouts/Primary/Primary';

const StyledAlert = styled(Alert)({
  position: 'fixed',
  top: navBarHeight,
  left: 0,
  width: '100%',
  zIndex: 1000,
  borderRadius: 0,
  justifyContent: 'center',
  '.MuiAlert-message': {
    width: '100%',
  },
});

interface EffectiveDateBannerProps {
  onClose: () => void;
}

export const EffectiveDateBanner: React.FC<EffectiveDateBannerProps> = ({
  onClose,
}) => {
  const thisYear = DateTime.now().year;
  const nextYear = thisYear + 1;

  return (
    <StyledAlert
      severity="warning"
      onClose={onClose}
      icon={false}
      data-testid="effective-date-banner-text"
    >
      <Typography fontWeight="bold" textAlign="center">
        <Trans
          i18nKey="effective_date_banner_message"
          values={{ thisYear, nextYear }}
        >
          Dates for {'{{nextYear}}'} are unavailable at this time while we
          update salary level tables. By December 15, {'{{thisYear}}'} you will
          be able to request a salary change for {'{{nextYear}}'}.
        </Trans>
      </Typography>
    </StyledAlert>
  );
};
