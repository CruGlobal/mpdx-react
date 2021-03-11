import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Circle from '@material-ui/icons/FiberManualRecord';
import { useTranslation } from 'react-i18next';

interface Props {
  giftStatusEnum: GiftStatusEnum;
}
export enum GiftStatusEnum {
  OnTime,
  Late,
  Hidden,
}
export const GiftStatus: React.FC<Props> = ({ giftStatusEnum }) => {
  const { t } = useTranslation();

  switch (giftStatusEnum) {
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
            <ErrorIcon style={{ color: '#F44336' }} />
          </span>
        </>
      );
  }
};

export default GiftStatus;
