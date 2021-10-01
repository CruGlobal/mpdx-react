import React from 'react';
import { useTheme } from '@material-ui/core';
import type { Theme } from '@material-ui/core/styles/createMuiTheme';
import ErrorIcon from '@material-ui/icons/Error';
import CircleIcon from '@material-ui/icons/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';

interface GiftStatusProps {
  lateAt?: string;
}

enum GiftStatusEnum {
  OnTime,
  Late,
  Hidden,
}

const giftIsLateStatus = (giftDate?: string): GiftStatusEnum => {
  if (!giftDate) {
    return GiftStatusEnum.Hidden;
  }

  return DateTime.now() > DateTime.fromISO(giftDate)
    ? GiftStatusEnum.Late
    : GiftStatusEnum.OnTime;
};

export const GiftStatus: React.FC<GiftStatusProps> = ({ lateAt }) => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();

  switch (giftIsLateStatus(lateAt)) {
    case GiftStatusEnum.Hidden:
      return null;
    case GiftStatusEnum.OnTime:
      return (
        <CircleIcon
          style={{ color: theme.palette.mpdxGreen.main }}
          titleAccess={t('On Time')}
        />
      );
    case GiftStatusEnum.Late:
      return <ErrorIcon color="error" titleAccess={t('Late')} />;
  }
};

export default GiftStatus;
