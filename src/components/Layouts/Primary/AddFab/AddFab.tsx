import React, { ReactElement, useState } from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../../App';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    speedDial: {
      position: 'fixed',
      bottom: theme.spacing(3),
      right: theme.spacing(3),
    },
  }),
);

const AddFab = (): ReactElement => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { openTaskDrawer } = useApp();

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleOpen = (): void => {
    setOpen(true);
  };

  const onTaskClick = (): void => {
    openTaskDrawer({});
    handleClose();
  };

  return (
    <>
      <SpeedDial
        ariaLabel="Add"
        className={classes.speedDial}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        <SpeedDialAction
          icon={<AssignmentIcon />}
          tooltipTitle={t('Task')}
          onClick={onTaskClick}
          tooltipOpen
        />
      </SpeedDial>
    </>
  );
};

export default AddFab;
