import React, { ReactElement, ReactNode } from 'react';
import { Theme, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((_theme: Theme) => ({
  title: {
    textTransform: 'uppercase',
    fontSize: '0.8rem',
  },
}));

interface Props {
  title: string;
  children: ReactNode;
  disableChildrenTypography?: boolean;
}

const InfoBlock = ({
  title,
  children,
  disableChildrenTypography,
}: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <>
      <Typography color="textSecondary" className={classes.title}>
        {title}
      </Typography>
      {disableChildrenTypography ? (
        children
      ) : (
        <Typography>{children}</Typography>
      )}
    </>
  );
};

export default InfoBlock;
