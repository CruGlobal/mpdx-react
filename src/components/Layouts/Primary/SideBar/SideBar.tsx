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
    IconButton,
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import clsx from 'clsx';
import { SpeedDialIcon } from '@material-ui/lab';
import { useApp } from '../../../App';

export const SIDE_BAR_WIDTH = 256;
export const SIDE_BAR_MINIMIZED_WIDTH = 57;

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
            paddingLeft: theme.spacing(0.5),
        },
        logo: {},
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
        iconButton: {
            color: '#fff',
            marginRight: theme.spacing(2),
        },
        drawer: {
            width: SIDE_BAR_WIDTH,
            flexShrink: 0,
            whiteSpace: 'nowrap',
        },
        drawerOpen: {
            width: SIDE_BAR_WIDTH,
            transition: theme.transitions.create('width', {
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                duration: theme.transitions.duration.leavingScreen,
                delay: 20,
            }),
            overflowX: 'hidden',
            width: SIDE_BAR_MINIMIZED_WIDTH,
        },
    }),
);

interface Props {
    open: boolean;
    handleOpenChange: (state?: boolean) => void;
}

const SideBar = ({ open, handleOpenChange }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const {
        state: { accountListId },
    } = useApp();

    const drawer = (
        <Box>
            <Box px={2} className={classes.toolbar}>
                <IconButton className={classes.iconButton} onClick={(): void => handleOpenChange()}>
                    <SpeedDialIcon icon={<MenuIcon />} openIcon={<ChevronLeftIcon />} open={open} />
                </IconButton>
                <Box className={classes.logo}>
                    <img src={require('../../../../images/logo.svg')} alt="logo" />
                </Box>
            </Box>
            <Divider className={classes.divider} />
            <List className={classes.list}>
                <Link href="/accountLists/[accountListId]" as={`/accountLists/${accountListId}`} passHref>
                    <ListItem
                        className={classes.listItem}
                        button
                        onClick={(): void => handleOpenChange(false)}
                        data-testid="SideBarOverview"
                    >
                        <ListItemIcon className={classes.listItemIcon}>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText className={classes.listItemText} primary={t('Overview')} />
                    </ListItem>
                </Link>
                <Link
                    href="/accountLists/[accountListId]/tasks/[tab]"
                    as={`/accountLists/${accountListId}/tasks/list`}
                    passHref
                >
                    <ListItem
                        className={classes.listItem}
                        button
                        onClick={(): void => handleOpenChange(false)}
                        data-testid="SideBarTasks"
                    >
                        <ListItemIcon className={classes.listItemIcon}>
                            <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText className={classes.listItemText} primary={t('Tasks')} />
                    </ListItem>
                </Link>
                <Link
                    href="/accountLists/[accountListId]/reports/donations"
                    as={`/accountLists/${accountListId}/reports/donations`}
                    passHref
                >
                    <ListItem
                        className={classes.listItem}
                        button
                        onClick={(): void => handleOpenChange(false)}
                        data-testid="SideBarDonations"
                    >
                        <ListItemIcon className={classes.listItemIcon}>
                            <CardGiftcardIcon />
                        </ListItemIcon>
                        <ListItemText className={classes.listItemText} primary={t('Donations')} />
                    </ListItem>
                </Link>
            </List>
        </Box>
    );

    return (
        <>
            <nav className={classes.nav}>
                <Hidden mdUp>
                    <Drawer
                        variant="temporary"
                        open={open}
                        onClose={(): void => handleOpenChange(false)}
                        classes={{ paper: classes.drawerPaper }}
                        ModalProps={{ keepMounted: true }}
                        data-testid="SideBarMobileDrawer"
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden smDown>
                    <Drawer
                        variant="permanent"
                        open={open}
                        data-testid="SideBarDesktopDrawer"
                        className={clsx(classes.drawer, {
                            [classes.drawerOpen]: open,
                            [classes.drawerClose]: !open,
                        })}
                        classes={{
                            paper: clsx(classes.drawerPaper, {
                                [classes.drawerOpen]: open,
                                [classes.drawerClose]: !open,
                            }),
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
        </>
    );
};

export default SideBar;
