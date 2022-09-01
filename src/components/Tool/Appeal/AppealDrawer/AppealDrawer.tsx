import React, { ReactElement } from 'react';
import { Drawer } from '@mui/material';
import { makeStyles } from '@mui/styles';
import theme from '../../../../theme';
import NavToolDrawerHandle from '../../NavToolList/NavToolDrawerHandle';
import { TestAppeal } from '../../../../../pages/accountLists/[accountListId]/tools/appeals/testAppeal';
import AppealDrawerList from './AppealDrawerList';
//import { useAppealId } from '../../../../src/hooks/useAppealId';

const useStyles = makeStyles(() => ({
  drawer: {
    zIndex: 1,
  },
  navToggle: {
    backgroundColor: theme.palette.mpdxBlue.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.mpdxBlue.main,
    },
  },
  list: {
    width: '290px',
    transform: 'translateY(55px)',
    [theme.breakpoints.down('xs')]: {
      transform: 'translateY(45px)',
    },
  },
  li: {
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
  },
}));

export interface Props {
  open: boolean;
  toggle: () => void;
  selectedId?: string;
  appeal: TestAppeal;
}

const AppealDrawer = ({ open, toggle, appeal }: Props): ReactElement => {
  const classes = useStyles();
  //const appealId = useAppealId();

  return (
    <>
      <Drawer
        anchor={'left'}
        open={open}
        onClose={toggle}
        variant="persistent"
        className={classes.drawer}
      >
        <AppealDrawerList appeal={appeal} />
      </Drawer>
      <NavToolDrawerHandle open={open} toggle={toggle} />
    </>
  );
};

export default AppealDrawer;
