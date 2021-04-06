import React, { ReactElement, useEffect, useState } from 'react';
import { makeStyles, Theme, Fab, CircularProgress } from '@material-ui/core';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = makeStyles((_theme: Theme) => ({
  box: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginLeft: '-28px',
    marginTop: '-28px',
  },
  fab: {
    backgroundColor: _theme.palette.common.white,
    cursor: 'default',
    '&:hover': {
      backgroundColor: _theme.palette.common.white,
    },
  },
}));

interface Props {
  loading?: boolean;
}

const Loading = ({ loading = false }: Props): ReactElement => {
  const classes = useStyles();
  const router = useRouter();

  const [currentlyLoading, setCurrentlyLoading] = useState(loading);

  useEffect(() => {
    const handleStart = (): void => {
      setCurrentlyLoading(true);
    };

    const handleComplete = (): void => {
      setCurrentlyLoading(false);
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
      {currentlyLoading && (
        <motion.div
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          className={classes.box}
          data-testid="Loading"
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
