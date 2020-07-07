import React, { ReactElement, useState } from 'react';
import { makeStyles, BottomNavigation, BottomNavigationAction, Theme } from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';

const useStyles = makeStyles((_theme: Theme) => ({
    bottomNavigation: {
        width: '100%',
        paddingBottom: `env(safe-area-inset-bottom)`,
        boxSizing: 'content-box',
    },
    bottomNavigationBlock: {
        backgroundColor: '#f6f7f9',
    },
    bottomNavigationFixed: {
        position: 'fixed',
        bottom: 0,
    },
}));

const BottomBar = (): ReactElement => {
    const classes = useStyles();
    const [value, setValue] = useState(0);

    return (
        <>
            <BottomNavigation className={[classes.bottomNavigation, classes.bottomNavigationBlock].join(' ')} />
            <BottomNavigation
                value={value}
                onChange={(_event, newValue): void => {
                    setValue(newValue);
                }}
                showLabels
                className={[classes.bottomNavigation, classes.bottomNavigationFixed].join(' ')}
            >
                <BottomNavigationAction label="Overview" icon={<HomeIcon />} />
            </BottomNavigation>
        </>
    );
};

export default BottomBar;
