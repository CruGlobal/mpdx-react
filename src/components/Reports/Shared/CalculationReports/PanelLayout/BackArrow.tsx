import NextLink from 'next/link';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface BackArrowProps {
  backHref: string;
  backTitle?: string;
}

export const BackArrow: React.FC<BackArrowProps> = ({
  backHref,
  backTitle,
}) => {
  const { t } = useTranslation();

  return (
    <Link
      component={NextLink}
      href={backHref}
      sx={{ textDecoration: 'none' }}
      aria-label={backTitle ?? t('Back to dashboard')}
    >
      <IconButton
        title={backTitle ?? t('Back to dashboard')}
        sx={(theme) => ({
          color: theme.palette.cruGrayDark.main,
        })}
      >
        <ArrowBackIcon />
      </IconButton>
    </Link>
  );
};
