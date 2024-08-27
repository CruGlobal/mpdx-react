import React, { ReactElement } from 'react';
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import { Box, IconButton, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import theme from 'src/theme';

const useStyles = makeStyles()((theme: Theme) => ({
  navToggle: {
    backgroundColor: theme.palette.mpdxBlue.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.mpdxBlue.main,
    },
  },
}));

export interface Props {
  open: boolean;
  toggle: (isOpen: boolean) => void;
}

const NavToolDrawerHandle = ({ open, toggle }: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <Box
      display="flex"
      alignItems="center"
      style={{
        height: '100vh',
        position: 'fixed',
        zIndex: 10,
        width: '30px',
        transition: 'left 0.2s',
        left: open ? 290 : 0,
        backgroundColor: theme.palette.mpdxBlue.main,
      }}
    >
      <IconButton onClick={() => toggle(!open)} className={classes.navToggle}>
        <DoubleArrowIcon
          style={{
            transform: open ? 'rotate(180deg)' : '',
            transition: 'transform 0.5s',
          }}
        />
      </IconButton>
    </Box>
  );
};

export default NavToolDrawerHandle;
