import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Circle from '@material-ui/icons/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { DateTime } from 'luxon';
import theme from '../../../theme';

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
  const { t } = useTranslation();

  switch (giftIsLateStatus(lateAt)) {
    case GiftStatusEnum.Hidden:
      return null;
    case GiftStatusEnum.OnTime:
      return (
        <span title={t('On Time')}>
          <Circle style={{ color: '#00CA99' }} />
        </span>
      );
    case GiftStatusEnum.Late:
      return (
        <span title={t('Late')}>
          <ErrorIcon style={{ color: theme.palette.error.main }} />
        </span>
      );
  }
};

export default GiftStatus;
