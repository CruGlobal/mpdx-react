import React, { ReactElement } from 'react';
import {
    makeStyles,
    Toolbar,
    AppBar,
    useScrollTrigger,
    Theme,
    Avatar,
    IconButton,
    Button,
    MenuItem,
    Box,
    Menu,
    Grid,
    ListSubheader,
} from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useQuery, gql } from '@apollo/client';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Link from 'next/link';
import { GetTopbarQuery } from '../../../types/GetTopbarQuery';

const useStyles = makeStyles((theme: Theme) => ({
    appBar: {
        '&::after': {
            position: 'absolute',
            zIndex: -1,
            content: '""',
            width: '100%',
            height: '100%',
            boxShadow: '0px 1px 2px 0px rgba(60,64,67,.3), 0px 1px 3px 1px rgba(60,64,67,.15)',
            opacity: 0,
            transition: 'opacity .15s cubic-bezier(0.4, 0, 1, 1)',
        },
    },
    appBarElevated: {
        '&::after': {
            opacity: 1,
        },
        '& $breadcrumb': {
            opacity: 1,
            transform: 'translate(0, 0)',
        },
    },
    toolbar: {
        backgroundColor: theme.palette.primary.main,
        minHeight: '48px',
        paddingTop: 'env(safe-area-inset-top)',
    },
    logoGrid: {
        order: 1,
        height: '32px',
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
    },
    menuList: {
        paddingTop: 0,
    },
}));

interface ElevationScrollProps {
    children: React.ReactElement;
    className: string;
    elevatedClassName: string;
}

const ElevationScroll = ({ children, className, elevatedClassName }: ElevationScrollProps): ReactElement => {
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });

    return React.cloneElement(children, {
        className: trigger ? elevatedClassName : className,
    });
};

export const GET_TOPBAR_QUERY = gql`
    query GetTopbarQuery {
        accountLists {
            nodes {
                id
                name
            }
        }
        user {
            firstName
        }
        currentAccountListId @client
        breadcrumb @client
    }
`;

const TopBar = (): ReactElement => {
    const classes = useStyles();
    const { data } = useQuery<GetTopbarQuery>(GET_TOPBAR_QUERY);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    return (
        <>
            <ElevationScroll
                className={classes.appBar}
                elevatedClassName={[classes.appBar, classes.appBarElevated].join(' ')}
            >
                <AppBar elevation={0}>
                    <Toolbar className={classes.toolbar}>
                        <Grid container alignItems="center">
                            {!data?.currentAccountListId && (
                                <Grid className={classes.logoGrid} item>
                                    <img src="/logo.svg" alt="logo" />
                                </Grid>
                            )}
                            <Grid item className={classes.accountListsGrid}>
                                {data?.currentAccountListId && data?.accountLists?.nodes && (
                                    <>
                                        <Box display={{ xs: 'none', sm: 'block' }}>
                                            <Button
                                                aria-controls="account-list-selector"
                                                aria-haspopup="true"
                                                onClick={handleClick}
                                                className={[classes.button, classes.link].join(' ')}
                                                endIcon={data.accountLists.nodes.length > 1 && <ArrowDropDownIcon />}
                                                size="small"
                                            >
                                                {
                                                    data.accountLists.nodes.find(
                                                        (node) => node.id == data.currentAccountListId,
                                                    )?.name
                                                }
                                            </Button>
                                        </Box>
                                        <Box display={{ xs: 'block', sm: 'none' }}>
                                            <IconButton
                                                aria-controls="account-list-selector"
                                                aria-haspopup="true"
                                                onClick={handleClick}
                                                className={classes.link}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                        <Menu
                                            id="simple-menu"
                                            anchorEl={anchorEl}
                                            keepMounted
                                            open={Boolean(anchorEl)}
                                            onClose={handleClose}
                                            classes={{ list: classes.menuList }}
                                        >
                                            <Link href="/accountLists">
                                                <MenuItem onClick={handleClose}>See All Account Lists</MenuItem>
                                            </Link>
                                            <ListSubheader>Account Lists</ListSubheader>
                                            {data.accountLists.nodes.map(({ id, name }) => (
                                                <Link key={id} href="/accountLists/[id]" as={`/accountLists/${id}`}>
                                                    <MenuItem
                                                        selected={id == data.currentAccountListId}
                                                        onClick={handleClose}
                                                    >
                                                        {name}
                                                    </MenuItem>
                                                </Link>
                                            ))}
                                        </Menu>
                                    </>
                                )}
                            </Grid>
                            <Grid item className={classes.breadcrumbGrid}>
                                {data?.currentAccountListId && data?.breadcrumb && (
                                    <Box className={classes.breadcrumb}>{data?.breadcrumb}</Box>
                                )}
                            </Grid>
                            <Grid item className={classes.helpGrid}>
                                <Button
                                    href="https://help.mpdx.org"
                                    className={[classes.button, classes.link].join(' ')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Go to help
                                </Button>
                            </Grid>
                            <Grid item className={classes.notificationsGrid}>
                                <IconButton className={classes.link}>
                                    <NotificationsIcon />
                                </IconButton>
                            </Grid>
                            <Grid item className={classes.avatarGrid}>
                                <Avatar className={classes.avatar}>{data?.user?.firstName[0]}</Avatar>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
            </ElevationScroll>
            <Toolbar className={classes.toolbar} />
        </>
    );
};

export default TopBar;
