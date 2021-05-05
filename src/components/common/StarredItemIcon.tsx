import { styled } from '@material-ui/core';
import React from 'react';
import { StarBorderOutlined } from '@material-ui/icons';
import StarIcon from '@material-ui/icons/Star';

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
  return isStarred ? <StarFilled /> : <StarOutline />;
};
