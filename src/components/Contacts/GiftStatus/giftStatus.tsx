import React from 'react';
import ErrorIcon from '@material-ui/icons/Error';
import Circle from '@material-ui/icons/FiberManualRecord';

interface Props {
  giftStatusEnum: GiftStatusEnum;
}
export enum GiftStatusEnum {
  OnTime,
  Late,
  Hidden,
}
export const GiftStatus: React.FC<Props> = ({ giftStatusEnum }) => {
  const statusView = () => {
    switch (giftStatusEnum) {
      case GiftStatusEnum.Hidden:
        return null;
      case GiftStatusEnum.OnTime:
        return <Circle style={{ color: '#00CA99' }} />;
      case GiftStatusEnum.Late:
        return <ErrorIcon style={{ color: '#F44336' }} />;
    }
  };
  return <>{statusView()} </>;
};

export default GiftStatus;
