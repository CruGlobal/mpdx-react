import React, { ReactElement, useEffect, useState } from 'react';
import { makeStyles, Theme, Fab, CircularProgress } from '@material-ui/core';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginLeft: '-28px',
        marginTop: '-28px',
    },
    fab: {
        backgroundColor: '#fff',
        cursor: 'default',
        '&:hover': {
            backgroundColor: '#fff',
        },
    },
}));

const Loading = (): ReactElement => {
    const classes = useStyles();
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleStart = (): void => {
            setLoading(true);
        };

        const handleComplete = (): void => {
            setLoading(false);
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return (): void => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    });

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={classes.box}
                >
                    <Fab color="default" disableRipple className={classes.fab}>
                        <CircularProgress size={30} />
                    </Fab>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Loading;
