import React from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderOutlined from '@mui/icons-material/StarBorderOutlined';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface Props {
  isStarred: boolean;
}

const StarFilled = styled(StarIcon)(({ theme }) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.primary.dark,
}));

const StarOutline = styled(StarBorderOutlined)(({ theme }) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.secondary.dark,
}));

export const StarredItemIcon: React.FC<Props> = ({ isStarred }) => {
  const { t } = useTranslation();
  return isStarred ? (
    <StarFilled titleAccess={t('Unstar')} data-testid="Filled Star Icon" />
  ) : (
    <StarOutline titleAccess={t('Star')} data-testid="Outline Star Icon" />
  );
};
