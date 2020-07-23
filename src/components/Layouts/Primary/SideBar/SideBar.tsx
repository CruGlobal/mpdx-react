import React, { ReactElement } from 'react';
import {
    Divider,
    Drawer,
    Hidden,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Theme,
    createStyles,
    Box,
    ListItemIcon,
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';

export const SIDE_BAR_WIDTH = 256;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        nav: {
            [theme.breakpoints.up('sm')]: {
                width: SIDE_BAR_WIDTH,
                flexShrink: 0,
            },
        },
        toolbar: {
            ...theme.mixins.toolbar,
            display: 'flex',
            alignItems: 'center',
        },
        drawerPaper: {
            paddingTop: `env(safe-area-inset-top)`,
            paddingBottom: `env(safe-area-inset-bottom)`,
            paddingLeft: `env(safe-area-inset-left)`,
            backgroundColor: 'rgb(5, 30, 52)',
            backgroundImage: `url(${require('./sideBar.png')})`,
            backgroundPosition: 'left 0 bottom 0',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '256px 556px',
            width: SIDE_BAR_WIDTH,
        },
        divider: {
            backgroundColor: '#2A4865',
        },
        list: {
            padding: 0,
        },
        listItem: {
            borderBottom: '1px solid #1B3A57',
        },
        listItemIcon: {
            color: '#fff',
        },
        listItemText: {
            color: '#fff',
        },
    }),
);

interface Props {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

const SideBar = ({ mobileOpen, handleDrawerToggle }: Props): ReactElement => {
    const classes = useStyles();

    const drawer = (
        <div>
            <Box px={2} className={classes.toolbar}>
                <img src={require('../../../../images/logo.svg')} />
            </Box>
            <Divider className={classes.divider} />
            <List className={classes.list}>
                <ListItem className={classes.listItem} button onClick={handleDrawerToggle}>
                    <ListItemIcon className={classes.listItemIcon}>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText className={classes.listItemText} primary="Overview" data-testid="SideBarOverview" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <>
            <nav className={classes.nav}>
                <Hidden mdUp>
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{ paper: classes.drawerPaper }}
                        ModalProps={{ keepMounted: true }}
                        data-testid="SideBarMobileDrawer"
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden smDown>
                    <Drawer
                        classes={{ paper: classes.drawerPaper }}
                        variant="permanent"
                        open
                        data-testid="SideBarDesktopDrawer"
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
        </>
    );
};

export default SideBar;
