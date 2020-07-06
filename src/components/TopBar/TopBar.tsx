import React, { ReactElement, ReactNode } from 'react';
import { makeStyles, Toolbar, AppBar, useScrollTrigger, Theme, Grid } from '@material-ui/core';

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

interface Props {
    children?: ReactNode;
}

const TopBar = ({ children }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <>
            <ElevationScroll
                className={classes.appBar}
                elevatedClassName={[classes.appBar, classes.appBarElevated].join(' ')}
            >
                <AppBar elevation={0}>
                    <Toolbar className={classes.toolbar}>
                        <Grid container alignItems="center">
                            {children}
                        </Grid>
                    </Toolbar>
                </AppBar>
            </ElevationScroll>
            <Toolbar className={classes.toolbar} />
        </>
    );
};

export default TopBar;
