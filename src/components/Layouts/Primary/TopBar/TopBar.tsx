import React, { ReactElement, useState, useRef, useEffect } from 'react';
import {
    Avatar,
    IconButton,
    Button,
    MenuItem,
    Box,
    Menu,
    ListSubheader,
    makeStyles,
    Toolbar,
    AppBar,
    useScrollTrigger,
    Theme,
    Grid,
    Hidden,
} from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useQuery, gql } from '@apollo/client';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Link from 'next/link';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { GetTopBarQuery } from '../../../../../types/GetTopBarQuery';
import { SIDE_BAR_MINIMIZED_WIDTH, SIDE_BAR_WIDTH } from '../SideBar/SideBar';
import { useApp } from '../../../App';

const useStyles = makeStyles((theme: Theme) => ({
    appBar: {
        paddingTop: `env(safe-area-inset-top)`,
        paddingLeft: `env(safe-area-inset-left)`,
        paddingRight: `env(safe-area-inset-right)`,
        backgroundColor: theme.palette.primary.main,
        width: 'auto',
        left: SIDE_BAR_MINIMIZED_WIDTH,
        [theme.breakpoints.down('sm')]: {
            left: 0,
        },
    },
    toolbar: {
        backgroundColor: theme.palette.primary.main,
    },
    container: {
        minHeight: '48px',
    },
    sideBarGrid: {
        order: 1,
    },
    accountListsGrid: {
        order: 2,
        [theme.breakpoints.down('xs')]: {
            order: 6,
            marginRight: theme.spacing(1),
        },
    },
    breadcrumbGrid: {
        order: 3,
        marginLeft: theme.spacing(1),
        height: '48px',
        overflow: 'hidden',
        flexGrow: 1,
    },
    helpGrid: {
        order: 4,
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    notificationsGrid: {
        order: 5,
    },
    avatarGrid: {
        order: 6,
    },
    avatar: {
        height: '32px',
        width: '32px',
    },
    link: {
        textTransform: 'none',
        color: 'rgba(255,255,255,0.75)',
        transition: 'color 0.2s ease-in-out',
        '&:hover': {
            color: 'rgba(255,255,255,1)',
        },
    },
    button: {
        textTransform: 'none',
    },
    breadcrumb: {
        fontWeight: 'bold',
        transform: 'translate(0, 48px)',
        transition: 'opacity .15s ease, transform .15s ease',
        lineHeight: '48px',
        opacity: 0,
    },
    breadcrumbTrigger: {
        transform: 'translate(0, 0)',
        opacity: 1,
    },
    menuList: {
        paddingTop: 0,
    },
    logo: {
        width: 70,
        transition: theme.transitions.create('margin-right', {
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: theme.spacing(2),
        '& img': {
            marginLeft: -13,
        },
    },
    logoOpen: {
        marginRight: SIDE_BAR_WIDTH - 70 - SIDE_BAR_MINIMIZED_WIDTH,
    },
}));

export const GET_TOP_BAR_QUERY = gql`
    query GetTopBarQuery {
        accountLists {
            nodes {
                id
                name
            }
        }
        user {
            id
            firstName
            lastName
        }
    }
`;

interface Props {
    open: boolean;
    handleOpenChange: (state?: boolean) => void;
}

const TopBar = ({ open, handleOpenChange }: Props): ReactElement => {
    const classes = useStyles();
    const { dispatch, state } = useApp();
    const { t } = useTranslation();
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });
    const { data } = useQuery<GetTopBarQuery>(GET_TOP_BAR_QUERY);
    const [accountListMenuOpen, setAccountListMenuOpen] = useState(false);
    const anchorEl = useRef(null);

    const handleAccountListMenuOpen = (): void => {
        setAccountListMenuOpen(true);
    };

    const handleAccountListMenuClose = (): void => {
        setAccountListMenuOpen(false);
    };

    const currentAccountList = data?.accountLists?.nodes?.find((node) => node.id == state.accountListId);

    useEffect(() => {
        data?.user && dispatch({ type: 'updateUser', user: data.user });
    }, [data?.user]);

    return (
        <>
            <AppBar className={classes.appBar} elevation={trigger ? 3 : 0}>
                <Toolbar className={classes.toolbar}>
                    <Grid container className={classes.container} alignItems="center">
                        <Grid item className={classes.sideBarGrid}>
                            <Hidden mdUp>
                                <IconButton
                                    color="inherit"
                                    edge="start"
                                    onClick={() => handleOpenChange(true)}
                                    aria-label="Show Menu"
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Hidden>

                            <Hidden smDown>
                                <Box className={clsx(classes.logo, { [classes.logoOpen]: open })}>
                                    <img src={require('../../../../images/logo.svg')} alt="logo" />
                                </Box>
                            </Hidden>
                        </Grid>
                        <Grid item className={classes.accountListsGrid}>
                            {data?.accountLists?.nodes && (
                                <>
                                    {data.accountLists.nodes.length == 1 && (
                                        <Box
                                            display={{ xs: 'none', sm: 'block' }}
                                            data-testid="TopBarSingleAccountList"
                                        >
                                            {currentAccountList?.name}
                                        </Box>
                                    )}
                                    {data.accountLists.nodes.length > 1 && (
                                        <>
                                            <Hidden only="xs">
                                                <Button
                                                    onClick={handleAccountListMenuOpen}
                                                    className={[classes.button, classes.link].join(' ')}
                                                    endIcon={<ArrowDropDownIcon />}
                                                    size="small"
                                                    ref={anchorEl}
                                                    data-testid="TopBarButton"
                                                >
                                                    {currentAccountList?.name}
                                                </Button>
                                            </Hidden>
                                            <Hidden smUp>
                                                <IconButton
                                                    onClick={handleAccountListMenuOpen}
                                                    className={classes.link}
                                                    ref={anchorEl}
                                                    data-testid="TopBarButton"
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Hidden>
                                            <Menu
                                                data-testid="TopBarMenu"
                                                anchorEl={anchorEl?.current}
                                                open={accountListMenuOpen}
                                                onClose={handleAccountListMenuClose}
                                                classes={{ list: classes.menuList }}
                                            >
                                                <Link href="/accountLists" scroll={false}>
                                                    <MenuItem onClick={handleAccountListMenuClose}>
                                                        See All Account Lists
                                                    </MenuItem>
                                                </Link>
                                                <ListSubheader>Account Lists</ListSubheader>
                                                {data.accountLists.nodes.map(({ id, name }) => (
                                                    <Link
                                                        key={id}
                                                        href="/accountLists/[accountListId]"
                                                        as={`/accountLists/${id}`}
                                                        scroll={false}
                                                    >
                                                        <MenuItem
                                                            selected={id == state.accountListId}
                                                            onClick={handleAccountListMenuClose}
                                                            data-testid={`TopBarMenuItem${id}`}
                                                        >
                                                            {name}
                                                        </MenuItem>
                                                    </Link>
                                                ))}
                                            </Menu>
                                        </>
                                    )}
                                </>
                            )}
                        </Grid>
                        <Grid item className={classes.breadcrumbGrid}>
                            {state.breadcrumb && (
                                <Box
                                    className={clsx(classes.breadcrumb, trigger && classes.breadcrumbTrigger)}
                                    data-testid="TopBarBreadcrumb"
                                >
                                    {state.breadcrumb}
                                </Box>
                            )}
                        </Grid>
                        <Grid item className={classes.helpGrid}>
                            <Button
                                href="https://help.mpdx.org"
                                className={[classes.button, classes.link].join(' ')}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t('Go to help')}
                            </Button>
                        </Grid>
                        <Grid item className={classes.notificationsGrid}>
                            <IconButton className={classes.link}>
                                <NotificationsIcon />
                            </IconButton>
                        </Grid>
                        <Grid item className={classes.avatarGrid}>
                            <Avatar className={classes.avatar}>{state.user?.firstName[0]}</Avatar>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <AppBar position="static" className={classes.appBar} elevation={0}>
                <Toolbar className={classes.toolbar}>
                    <Grid className={classes.container} />
                </Toolbar>
            </AppBar>
        </>
    );
};

export default TopBar;
