import React, { ReactElement, useState } from 'react';
import { Box, IconButton, makeStyles, Theme, Menu } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    textTransform: 'none',
    color: 'rgba(255,255,255,0.75)',
    transition: 'color 0.2s ease-in-out',
    '&:hover': {
      color: 'rgba(255,255,255,1)',
    },
  },
  menuPaper: {
    width: '50ch',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
}));

const AddMenu = (): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        className={classes.link}
        aria-controls="add-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <AddIcon />
      </IconButton>
      <Menu
        id="add-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        classes={{ paper: classes.menuPaper }}
      >
        <Box display="flex" flexDirection="row" justifyContent="center">
          <Box flexGrow={1}>{t('Add Menu')}</Box>
        </Box>
      </Menu>
    </>
  );
};

export default AddMenu;
