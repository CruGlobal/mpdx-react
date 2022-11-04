import React, { useMemo } from 'react';
import Typography from '@mui/material/Typography';
import type { Theme } from '@mui/material/styles/createTheme';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export enum ContactLateStatusEnum {
  OnTime,
  LateLessThirty,
  LateMoreThirty,
  LateMoreSixty,
}

interface ContactLateStatusProps {
  lateStatusEnum: ContactLateStatusEnum;
  isDetail?: boolean;
}

export const ContactLateStatusLabel: React.FC<ContactLateStatusProps> = ({
  lateStatusEnum,
  isDetail,
}) => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();

  const lateStatusLabel: string | undefined = useMemo(() => {
    switch (lateStatusEnum) {
      case ContactLateStatusEnum.OnTime:
        return t('On time');
      case ContactLateStatusEnum.LateLessThirty:
        return t('0-30 days late');
      case ContactLateStatusEnum.LateMoreThirty:
        return t('30-60 days late');
      case ContactLateStatusEnum.LateMoreSixty:
        return t('60+ days late');
    }
  }, [lateStatusEnum]);

  return !lateStatusLabel ? null : (
    <Typography
      component="span"
      style={{
        color:
          lateStatusEnum === ContactLateStatusEnum.OnTime
            ? theme.palette.mpdxGreen.main
            : lateStatusEnum === ContactLateStatusEnum.LateLessThirty
            ? theme.palette.cruGrayMedium.main
            : lateStatusEnum === ContactLateStatusEnum.LateMoreThirty
            ? theme.palette.cruYellow.main
            : lateStatusEnum === ContactLateStatusEnum.LateMoreSixty
            ? theme.palette.error.main
            : undefined,
      }}
    >
      {isDetail ? lateStatusLabel : `(${lateStatusLabel})`}
    </Typography>
  );
};
