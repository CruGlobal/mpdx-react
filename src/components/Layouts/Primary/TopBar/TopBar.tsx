import React, { ReactElement, useState, useEffect } from 'react';
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
    ListItemText,
    Divider,
    ListItemAvatar,
    Link,
} from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useQuery, gql } from '@apollo/client';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { signout } from 'next-auth/client';
import { compact } from 'lodash/fp';
import NextLink from 'next/link';
import { GetTopBarQuery } from '../../../../../types/GetTopBarQuery';
import { SIDE_BAR_MINIMIZED_WIDTH, SIDE_BAR_WIDTH } from '../SideBar/SideBar';
import { useApp } from '../../../App';
import HandoffLink from '../../../HandoffLink';

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
    menuItemAccount: {
        paddingTop: 0,
        outline: 0,
    },
    menuItemFooter: {
        fontSize: theme.typography.body2.fontSize,
        justifyContent: 'center',
        paddingTop: theme.spacing(2),
        outline: 0,
    },
    menuButton: {
        width: '100%',
        marginTop: theme.spacing(1),
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
            keyAccounts {
                id
                email
            }
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
    const [accountListMenuAnchorEl, setAccountListMenuAnchorEl] = useState(null);
    const accountListMenuOpen = Boolean(accountListMenuAnchorEl);
    const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
    const profileMenuOpen = Boolean(profileMenuAnchorEl);

    const handleAccountListMenuOpen = (event) => {
        setAccountListMenuAnchorEl(event.currentTarget);
    };

    const handleAccountListMenuClose = (): void => {
        setAccountListMenuAnchorEl(null);
    };

    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchorEl(null);
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
                                                    data-testid="TopBarButton"
                                                >
                                                    {currentAccountList?.name}
                                                </Button>
                                            </Hidden>
                                            <Hidden smUp>
                                                <IconButton
                                                    onClick={handleAccountListMenuOpen}
                                                    className={classes.link}
                                                    data-testid="TopBarButton"
                                                >
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </Hidden>
                                            <Menu
                                                data-testid="TopBarMenu"
                                                anchorEl={accountListMenuAnchorEl}
                                                open={accountListMenuOpen}
                                                onClose={handleAccountListMenuClose}
                                                classes={{ list: classes.menuList }}
                                            >
                                                <NextLink href="/accountLists" scroll={false}>
                                                    <MenuItem onClick={handleAccountListMenuClose}>
                                                        See All Account Lists
                                                    </MenuItem>
                                                </NextLink>
                                                <ListSubheader>Account Lists</ListSubheader>
                                                {data.accountLists.nodes.map(({ id, name }) => (
                                                    <NextLink
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
                                                    </NextLink>
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
                            <IconButton onClick={handleProfileMenuOpen}>
                                <Avatar className={classes.avatar}>{state.user?.firstName[0]}</Avatar>
                            </IconButton>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
            <AppBar position="static" className={classes.appBar} elevation={0}>
                <Toolbar className={classes.toolbar}>
                    <Grid className={classes.container} />
                </Toolbar>
            </AppBar>
            <Menu
                data-testid="profileMenu"
                anchorEl={profileMenuAnchorEl}
                open={profileMenuOpen}
                onClose={handleProfileMenuClose}
            >
                {data && (
                    <MenuItem button={false} className={classes.menuItemAccount}>
                        <ListItemAvatar>
                            <Avatar>{data.user.firstName[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={compact([data.user.firstName, data.user.lastName]).join(' ')}
                            secondary={data.user.keyAccounts[0]?.email}
                        />
                    </MenuItem>
                )}
                <Divider />
                <HandoffLink path="/preferences/personal">
                    <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Preferences')} />
                    </MenuItem>
                </HandoffLink>
                <HandoffLink path="/preferences/notifications">
                    <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Notifications')} />
                    </MenuItem>
                </HandoffLink>
                <HandoffLink path="/preferences/integrations">
                    <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Connect Services')} />
                    </MenuItem>
                </HandoffLink>
                <HandoffLink path="/preferences/accounts">
                    <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Manage Accounts')} />
                    </MenuItem>
                </HandoffLink>
                <HandoffLink path="/preferences/coaches">
                    <MenuItem onClick={handleProfileMenuClose} component="a">
                        <ListItemText primary={t('Manage Coaches')} />
                    </MenuItem>
                </HandoffLink>
                <MenuItem button={false}>
                    <Button className={classes.menuButton} variant="outlined" color="default" onClick={signout}>
                        {t('Sign Out')}
                    </Button>
                </MenuItem>
                <MenuItem button={false} className={classes.menuItemFooter}>
                    <Link href="https://get.mpdx.org/privacy-policy/" target="_blank" onClick={handleProfileMenuClose}>
                        {t('Privacy Policy')}
                    </Link>
                    &nbsp; • &nbsp;
                    <Link href="https://get.mpdx.org/terms-of-use/" target="_blank" onClick={handleProfileMenuClose}>
                        {t('Terms of Use')}
                    </Link>
                </MenuItem>
            </Menu>
        </>
    );
};

export default TopBar;
