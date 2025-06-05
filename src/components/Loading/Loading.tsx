import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CircularProgress, Fab, Theme } from '@mui/material';
import clsx from 'clsx';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: Theme) => ({
  box: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    marginLeft: '-28px',
    marginTop: '-28px',
    zIndex: 1000,
    opacity: 0,
    transition: theme.transitions.create(['opacity', 'visibility'], {
      duration: theme.transitions.duration.short,
    }),
    visibility: 'hidden',
  },
  visible: {
    opacity: 1,
    visibility: 'visible',
  },
  fab: {
    backgroundColor: theme.palette.common.white,
    cursor: 'default',
    '&:hover': {
      backgroundColor: theme.palette.common.white,
    },
  },
}));

interface Props {
  loading?: boolean;
}

const Loading: React.FC<Props> = ({ loading = false }) => {
  const { classes } = useStyles();
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
  }, []);

  return (
    <div
      className={clsx(classes.box, currentlyLoading && classes.visible)}
      data-testid="Loading"
    >
      <Fab color="default" disableRipple className={classes.fab}>
        <CircularProgress size={30} />
      </Fab>
    </div>
  );
};

export default Loading;
