import { styled } from '@mui/material';
import React from 'react';
import { StarBorderOutlined } from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';

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
  return isStarred ? (
    <StarFilled titleAccess="Filled Star Icon" />
  ) : (
    <StarOutline titleAccess="Outline Star Icon" />
  );
};
