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
      color={
        lateStatusEnum === ContactLateStatusEnum.OnTime
          ? 'textPrimary'
          : 'error'
      }
    >
      ({lateStatusLabel})
    </Typography>
  );
};
