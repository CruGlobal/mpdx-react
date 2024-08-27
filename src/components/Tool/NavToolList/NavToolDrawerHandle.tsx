import React, { ReactElement } from 'react';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { Box, IconButton, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  navToggle: {
    backgroundColor: theme.palette.mpdxBlue.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.mpdxBlue.main,
    },
    '@media (max-width: 600px)': {
      width: '30px',
      height: '30px',
    },
  },
  navDrawerHandleContainer: {
    height: '100vh',
    position: 'fixed',
    zIndex: 10,
    width: '20px',
    transition: 'left 0.2s',
    backgroundColor: theme.palette.mpdxBlue.main,

    '@media (min-width: 600px)': {
      width: '30px',
    },
  },
  navArrowIcon: {
    transition: 'transform 0.5s',
    '@media (max-width: 600px)': {
      fontSize: '1.25rem',
    },
  },
}));

export interface Props {
  isOpen: boolean;
  toggle: (isOpen: boolean) => void;
}

const NavToolDrawerHandle = ({ isOpen, toggle }: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <Box
      display="flex"
      alignItems="center"
      className={classes.navDrawerHandleContainer}
      style={{
        left: isOpen ? 290 : 0,
      }}
    >
      <IconButton onClick={() => toggle(!isOpen)} className={classes.navToggle}>
        <DoubleArrowIcon
          className={classes.navArrowIcon}
          style={{
            transform: isOpen ? 'rotate(180deg)' : '',
          }}
        />
      </IconButton>
    </Box>
  );
};

export default NavToolDrawerHandle;
