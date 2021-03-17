import { makeStyles } from '@material-ui/core';
import React from 'react';
import { StarBorderOutlined } from '@material-ui/icons';
import StarIcon from '@material-ui/icons/Star';
import theme from '../../../theme';

const useStyles = makeStyles(() => ({
  contactStar: {
    width: '24px',
    height: '24px',
    color: theme.palette.secondary.main,
  },
}));

interface Props {
  hasStar: boolean;
}

export const StarContactIcon: React.FC<Props> = ({ hasStar = false }) => {
  const classes = useStyles();
  return hasStar ? (
    <StarIcon className={classes.contactStar} />
  ) : (
    <StarBorderOutlined className={classes.contactStar} />
  );
};
