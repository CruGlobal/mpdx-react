import React, { ReactElement } from 'react';
import { Box, Skeleton, Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from '../../lib/intlFormat';

const useStyles = makeStyles()((theme: Theme) => ({
  box: {
    width: '100%',
    height: '54px',
    border: '2px solid #999999',
    borderRadius: '50px',
    padding: '2px',
    position: 'relative',
    marginBottom: theme.spacing(2),
  },
  progress: {
    position: 'absolute',
    left: '2px',
    height: '46px',
    minWidth: '46px',
    maxWidth: '99.6%',
    borderRadius: '46px',
    transition: 'width 1s ease-out',
    width: '0%',
  },
  skeleton: {
    borderRadius: '46px',
    height: '46px',
    transform: 'none',
  },
  primary: {
    background: 'linear-gradient(180deg, #FFE67C 0%, #FFCF07 100%)',
  },
  secondary: {
    border: '5px solid #FFCF07',
  },
}));

interface Props {
  loading?: boolean;
  primary?: number;
  secondary?: number;
}

const StyledProgress = ({
  loading,
  primary = 0,
  secondary = 0,
}: Props): ReactElement => {
  const locale = useLocale();
  const { classes } = useStyles();

  return (
    <Box className={classes.box}>
      {loading ? (
        <Skeleton
          data-testid="styledProgressLoading"
          className={classes.skeleton}
          animation="wave"
        />
      ) : (
        <>
          <Box
            style={{
              width: percentageFormat(secondary, locale).replace('\xa0', ''),
            }}
            className={[classes.progress, classes.secondary].join(' ')}
            data-testid="styledProgressSecondary"
          />
          <Box
            style={{
              width: percentageFormat(primary, locale).replace('\xa0', ''),
            }}
            className={[classes.progress, classes.primary].join(' ')}
            data-testid="styledProgressPrimary"
          />
        </>
      )}
    </Box>
  );
};

export default StyledProgress;
