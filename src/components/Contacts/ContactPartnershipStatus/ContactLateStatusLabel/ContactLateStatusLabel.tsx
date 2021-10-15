import React, { useMemo } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

export enum ContactLateStatusEnum {
  OnTime,
  LateLessThirty,
  LateMoreThirty,
  LateMoreSixty,
}

interface ContactLateStatusProps {
  lateStatusEnum: ContactLateStatusEnum;
}

export const ContactLateStatusLabel: React.FC<ContactLateStatusProps> = ({
  lateStatusEnum,
}) => {
  const { t } = useTranslation();

  const lateStatusLabel: string | undefined = useMemo(() => {
    switch (lateStatusEnum) {
      case ContactLateStatusEnum.OnTime:
        return t('On time');
      case ContactLateStatusEnum.LateLessThirty:
        return `0-30 ${t('days late')}`;
      case ContactLateStatusEnum.LateMoreThirty:
        return `30-60 ${t('days late')}`;
      case ContactLateStatusEnum.LateMoreSixty:
        return `60+ ${t('days late')}`;
    }
  }, [lateStatusEnum]);

  return !lateStatusLabel ? null : (
    <Typography
      component="span"
      color={
        lateStatusEnum === ContactLateStatusEnum.OnTime
          ? 'textPrimary'
          : 'error'
      }
    >
      {`(${lateStatusLabel})`}
    </Typography>
  );
};
