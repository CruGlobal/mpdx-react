import NextLink from 'next/link';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BackArrowProps {
  backHref?: string;
  onBack?: () => void;
  backTitle?: string;
}

export const BackArrow: React.FC<BackArrowProps> = ({
  backHref,
  onBack,
  backTitle,
}) => {
  const { t } = useTranslation();
  const label = backTitle ?? t('Back to dashboard');

  if (onBack) {
    return (
      <IconButton
        title={label}
        onClick={onBack}
        aria-label={label}
        sx={(theme) => ({
          color: theme.palette.mpdxGrayDark.main,
        })}
      >
        <ArrowBackIcon />
      </IconButton>
    );
  }

  if (backHref) {
    return (
      <IconButton
        component={NextLink}
        href={backHref}
        aria-label={label}
        title={label}
        sx={(theme) => ({
          color: theme.palette.mpdxGrayDark.main,
        })}
      >
        <ArrowBackIcon />
      </IconButton>
    );
  }

  return null;
};
