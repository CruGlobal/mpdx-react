import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Circle from '@material-ui/icons/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import theme from '../../../theme';

interface Props {
  status: GiftStatusEnum;
}
export enum GiftStatusEnum {
  OnTime,
  Late,
  Hidden,
}
export const GiftIsLateStatus = (
  giftDate: string | number | Date,
): GiftStatusEnum => {
  const date = new Date();

  if (giftDate == null) {
    return GiftStatusEnum.Hidden;
  }

  return new Date() > new Date(giftDate)
    ? GiftStatusEnum.Late
    : GiftStatusEnum.OnTime;
};

export const GiftStatus: React.FC<Props> = ({ status }) => {
  const { t } = useTranslation();

  switch (status) {
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
        <>
          <span title={t('Late')}>
            <ErrorIcon style={{ color: theme.palette.error.main }} />
          </span>
        </>
      );
  }
};

export default GiftStatus;
