import React from 'react';
import { useTheme } from '@material-ui/core';
import type { Theme } from '@material-ui/core/styles/createMuiTheme';
import ErrorIcon from '@material-ui/icons/Error';
import CircleIcon from '@material-ui/icons/FiberManualRecord';
import { useTranslation } from 'react-i18next';
import { ContactLateStatusEnum } from '../ContactLateStatusLabel/ContactLateStatusLabel';

interface ContactPartnershipStatusIconProps {
  lateStatusEnum: ContactLateStatusEnum;
}

export const ContactPartnershipStatusIcon: React.FC<ContactPartnershipStatusIconProps> = ({
  lateStatusEnum,
}) => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();

  switch (lateStatusEnum) {
    case ContactLateStatusEnum.OnTime:
      return (
        <CircleIcon
          style={{ color: theme.palette.mpdxGreen.main }}
          titleAccess={t('On Time')}
        />
      );
    case ContactLateStatusEnum.LateLessThirty:
      return (
        <CircleIcon
          style={{ color: theme.palette.cruGrayMedium.main }}
          titleAccess={t('Late Less Than Thirty')}
        />
      );
    case ContactLateStatusEnum.LateMoreThirty:
      return (
        <CircleIcon
          style={{ color: theme.palette.cruYellow.main }}
          titleAccess={t('Late More Than Thirty')}
        />
      );
    case ContactLateStatusEnum.LateMoreSixty:
      return (
        <ErrorIcon color="error" titleAccess={t('Late More Than Sixty')} />
      );
  }
};
