import React, { cloneElement, ReactElement } from 'react';
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
    Tooltip,
    ListSubheader,
    Badge,
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import AssignmentIcon from '@material-ui/icons/Assignment';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { SpeedDialIcon } from '@material-ui/lab';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import CardGiftcardIcon from '@material-ui/icons/CardGiftcard';
import EventNoteIcon from '@material-ui/icons/EventNote';
import AccountTreeIcon from '@material-ui/icons/AccountTree';
import AssessmentIcon from '@material-ui/icons/Assessment';
import ContactsIcon from '@material-ui/icons/Contacts';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn';
import EmailIcon from '@material-ui/icons/Email';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import PhoneIcon from '@material-ui/icons/Phone';
import DescriptionIcon from '@material-ui/icons/Description';
import ScheduleIcon from '@material-ui/icons/Schedule';
import BookmarksIcon from '@material-ui/icons/Bookmarks';
import TableChartIcon from '@material-ui/icons/TableChart';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import PeopleIcon from '@material-ui/icons/People';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { useApp } from '../../../App';
import HandoffLink from '../../../HandoffLink';
import { GetSideBarQuery } from '../../../../../types/GetSideBarQuery';
import logo from '../../../../images/logo.svg';

export const SIDE_BAR_WIDTH = 256;
export const SIDE_BAR_MINIMIZED_WIDTH = 57;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
        },
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
            backgroundColor: 'rgba(255,255,255,.4)',
        },
        list: {
            flexGrow: 1,
            padding: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
        },
        listItem: {
            backgroundColor: 'rgba(255,255,255,.05)',
            '&:hover': {
                backgroundColor: 'rgba(255,255,255,.1)',
            },
            '&.Mui-selected $listItemIcon, &.Mui-selected $listItemText': {
                color: '#64b5f6',
            },
        },
        listItemIcon: {
            color: 'rgba(255, 255, 255, .7)',
            fontSize: theme.typography.h5.fontSize,
        },
        listItemText: {
            color: '#fff',
        },
        listSubheader: {
            backgroundColor: 'rgba(255,255,255,.05)',
            borderTop: '1px solid rgba(255,255,255,.4)',
            fontSize: theme.typography.body1.fontSize,
            fontWeight: 'bold',
            color: '#fff',
            overflow: 'hidden',
            height: 50,
            transition: theme.transitions.create('height', {
                duration: theme.transitions.duration.leavingScreen,
            }),
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
            '& $listSubheader': {
                height: 0,
            },
        },
    }),
);

type ItemProps = LocalLinkProps | HandoffLinkProps;

interface BaseProps {
    label: string;
    icon: ReactElement;
}

interface LocalLinkProps extends BaseProps {
    type: 'local';
    href: string;
    as?: string;
}

interface HandoffLinkProps extends BaseProps {
    type: 'handoff';
    path: string;
}

interface Props {
    open: boolean;
    handleOpenChange: (state?: boolean) => void;
}

export const GET_SIDEBAR_BAR_QUERY = gql`
    query GetSideBarQuery($accountListId: ID!) {
        contactsFixCommitmentInfo: contacts(accountListId: $accountListId, statusValid: false) {
            totalCount
        }
        contactsFixMailingAddress: contacts(accountListId: $accountListId, addressValid: false) {
            totalCount
        }
        contactsFixSendNewsletter: contacts(
            accountListId: $accountListId
            status: [PARTNER_FINANCIAL, PARTNER_SPECIAL, PARTNER_PRAY]
            newsletter: NO_VALUE
        ) {
            totalCount
        }
        peopleFixEmailAddress: people(accountListId: $accountListId, emailAddressValid: false) {
            totalCount
        }
        peopleFixPhoneNumber: people(accountListId: $accountListId, phoneNumberValid: false) {
            totalCount
        }
        contactDuplicates(accountListId: $accountListId, ignore: false) {
            totalCount
        }
        personDuplicates(accountListId: $accountListId, ignore: false) {
            totalCount
        }
    }
`;

const SideBar = ({ open, handleOpenChange }: Props): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const {
        state: { accountListId },
    } = useApp();
    const { data } = useQuery<GetSideBarQuery>(GET_SIDEBAR_BAR_QUERY, { variables: { accountListId } });

    const Item = (props: ItemProps) => {
        const { asPath } = useRouter();

        const selected = props.type == 'local' && (asPath === props.href || asPath === props.as);

        const children = (
            <ListItem
                button
                onClick={(): void => handleOpenChange(false)}
                component="a"
                className={classes.listItem}
                selected={selected}
            >
                <ListItemIcon className={classes.listItemIcon}>
                    {cloneElement(props.icon, { fontSize: 'inherit' })}
                </ListItemIcon>
                <ListItemText className={classes.listItemText} primary={props.label} />
            </ListItem>
        );

        return (
            <Tooltip title={props.label} placement="right" disableHoverListener={open}>
                <Box>
                    {props.type == 'local' && (
                        <Link href={props.href} as={props.as} passHref>
                            {children}
                        </Link>
                    )}
                    {props.type == 'handoff' && <HandoffLink path={props.path}>{children}</HandoffLink>}
                </Box>
            </Tooltip>
        );
    };

    const drawer = (
        <Box className={classes.container}>
            <Box px={2} className={classes.toolbar}>
                <IconButton className={classes.iconButton} onClick={(): void => handleOpenChange()}>
                    <SpeedDialIcon icon={<MenuIcon />} openIcon={<ChevronLeftIcon />} open={open} />
                </IconButton>
                <Box className={classes.logo}>
                    <img src={logo} alt="logo" />
                </Box>
            </Box>
            <Divider className={classes.divider} />
            <List className={classes.list} component="div">
                <Item
                    type="local"
                    label={t('Dashboard')}
                    href="/accountLists/[accountListId]"
                    as={`/accountLists/${accountListId}`}
                    icon={<HomeIcon />}
                />
                <Item type="handoff" label={t('Contacts')} path="/contacts" icon={<AccountBoxIcon />} />
                <Item
                    type="local"
                    label={t('Tasks')}
                    href="/accountLists/[accountListId]/tasks"
                    as={`/accountLists/${accountListId}/tasks`}
                    icon={<AssignmentIcon />}
                />
                <ListSubheader className={classes.listSubheader} disableSticky>
                    {t('Reports')}
                </ListSubheader>
                <Item type="handoff" label={t('Gifts')} path="/reports/donations" icon={<CardGiftcardIcon />} />
                <Item type="handoff" label={t('14 Month Report')} path="/reports/salary" icon={<EventNoteIcon />} />
                <Item
                    type="handoff"
                    label={t('Designation Accounts')}
                    path="/reports/designation_accounts"
                    icon={<AccountTreeIcon />}
                />
                <Item
                    type="handoff"
                    label={t('Responsibility Centers')}
                    path="/reports/financial_accounts"
                    icon={<AccountBalanceIcon />}
                />
                <Item
                    type="handoff"
                    label={t('Expected Monthly Total')}
                    path="/reports/monthly"
                    icon={<ScheduleIcon />}
                />
                <Item
                    type="handoff"
                    label={t('Partner Giving Analysis')}
                    path="/reports/analysis"
                    icon={<AssessmentIcon />}
                />
                <Item type="handoff" label={t('Coaching')} path="/reports/coaching" icon={<SupervisorAccountIcon />} />
                <ListSubheader className={classes.listSubheader} disableSticky>
                    {t('Tools')}
                </ListSubheader>
                <Item type="handoff" label={t('Appeals')} path="/tools/appeals" icon={<BookmarksIcon />} />
                <Item
                    type="handoff"
                    label={t('Import from Google')}
                    path="/tools/import/google"
                    icon={<ContactsIcon />}
                />
                <Item type="handoff" label={t('Import from CSV')} path="/tools/import/csv" icon={<TableChartIcon />} />
                <Item
                    type="handoff"
                    label={t('Import from TntConnect')}
                    path="/tools/import/tnt"
                    icon={<CloudDownloadIcon />}
                />

                <Item
                    type="handoff"
                    label={t('Fix Commitment Info')}
                    path="/tools/fix/commitment-info"
                    icon={
                        <Badge
                            badgeContent={data?.contactsFixCommitmentInfo?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <MonetizationOnIcon />
                        </Badge>
                    }
                />

                <Item
                    type="handoff"
                    label={t('Fix Email Addresses')}
                    path="/tools/fix/email-addresses"
                    icon={
                        <Badge
                            badgeContent={data?.peopleFixEmailAddress?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <EmailIcon />
                        </Badge>
                    }
                />
                <Item
                    type="handoff"
                    label={t('Fix Mailing Addresses')}
                    path="/tools/fix/addresses"
                    icon={
                        <Badge
                            badgeContent={data?.contactsFixMailingAddress?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <MailOutlineIcon />
                        </Badge>
                    }
                />
                <Item
                    type="handoff"
                    label={t('Fix Phone Numbers')}
                    path="/tools/fix/phone-numbers"
                    icon={
                        <Badge
                            badgeContent={data?.peopleFixPhoneNumber?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <PhoneIcon />
                        </Badge>
                    }
                />
                <Item
                    type="handoff"
                    label={t('Fix Send Newsletter')}
                    path="/tools/fix/send-newsletter"
                    icon={
                        <Badge
                            badgeContent={data?.contactsFixSendNewsletter?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <DescriptionIcon />
                        </Badge>
                    }
                />
                <Item
                    type="handoff"
                    label={t('Merge Contacts')}
                    path="/tools/merge/contacts"
                    icon={
                        <Badge
                            badgeContent={data?.contactDuplicates?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <PeopleIcon />
                        </Badge>
                    }
                />
                <Item
                    type="handoff"
                    label={t('Merge People')}
                    path="/tools/merge/people"
                    icon={
                        <Badge
                            badgeContent={data?.personDuplicates?.totalCount || 0}
                            variant={open ? 'standard' : 'dot'}
                            max={9}
                            color="secondary"
                        >
                            <PeopleOutlineIcon />
                        </Badge>
                    }
                />
            </List>
        </Box>
    );

    return (
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
    );
};

export default SideBar;
