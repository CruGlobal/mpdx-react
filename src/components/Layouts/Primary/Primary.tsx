import React, { ReactElement, ReactNode, useState } from 'react';
import { Box, makeStyles, Theme, Hidden } from '@material-ui/core';
import clsx from 'clsx';
import AddFab from './AddFab';
import TopBar from './TopBar';
import SideBar from './SideBar';
import { SIDE_BAR_MINIMIZED_WIDTH, SIDE_BAR_WIDTH } from './SideBar/SideBar';
import BottomBar from './BottomBar';

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        backgroundColor: '#f6f7f9',
        minHeight: 'calc(100vh - 122px)',
        [theme.breakpoints.down('xs')]: {
            minHeight: '100vh',
        },
    },
    box: {
        transition: theme.transitions.create('margin-left', {
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: SIDE_BAR_WIDTH,
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
        },
    },
    boxClosed: {
        marginLeft: SIDE_BAR_MINIMIZED_WIDTH,
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
        },
    },
    addFabSpacer: {
        height: '100px',
    },
}));

interface Props {
    children: ReactNode;
}

const Primary = ({ children }: Props): ReactElement => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    const handleOpenChange = (state = !open): void => {
        setOpen(state);
    };

    return (
        <Box className={classes.container}>
            <SideBar open={open} handleOpenChange={handleOpenChange} />
            <Box className={clsx(classes.box, { [classes.boxClosed]: !open })}>
                <TopBar open={open} handleOpenChange={handleOpenChange} />
                {children}
            </Box>
            <Hidden smUp>
                <BottomBar />
            </Hidden>
            <AddFab />
            <Box className={classes.addFabSpacer}></Box>
        </Box>
    );
};

export default Primary;
