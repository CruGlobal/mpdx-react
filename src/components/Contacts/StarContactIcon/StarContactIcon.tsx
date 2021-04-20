import { styled } from '@material-ui/core';
import React from 'react';
import { StarBorderOutlined } from '@material-ui/icons';
import StarIcon from '@material-ui/icons/Star';
import theme from '../../../theme';

interface Props {
  hasStar: boolean;
}

const StarFilled = styled(StarIcon)(({}) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.primary.dark,
}));

const StarOutline = styled(StarBorderOutlined)(({}) => ({
  width: '24px',
  height: '24px',
  color: theme.palette.secondary.dark,
}));

export const StarContactIcon: React.FC<Props> = ({ hasStar = false }) => {
  return hasStar ? <StarFilled /> : <StarOutline />;
};
