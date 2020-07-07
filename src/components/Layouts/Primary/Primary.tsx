import React, { ReactElement, ReactNode, useState } from 'react';
import { Box, makeStyles, Theme, Hidden } from '@material-ui/core';
import TopBar from './TopBar';
import SideBar from './SideBar';
import { SIDE_BAR_WIDTH } from './SideBar/SideBar';
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
        marginLeft: SIDE_BAR_WIDTH,
        [theme.breakpoints.down('sm')]: {
            marginLeft: 0,
        },
    },
}));

interface Props {
    children: ReactNode;
}

const Primary = ({ children }: Props): ReactElement => {
    const classes = useStyles();
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleDrawerToggle = (): void => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box className={classes.container}>
            <SideBar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
            <Box className={classes.box}>
                <TopBar handleDrawerToggle={handleDrawerToggle} />
                {children}
            </Box>
            <Hidden smUp>
                <BottomBar />
            </Hidden>
        </Box>
    );
};

export default Primary;
