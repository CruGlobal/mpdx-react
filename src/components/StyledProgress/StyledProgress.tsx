import React, { ReactElement } from 'react';
import { Box, Skeleton, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from '../../lib/intlFormat';
import MinimalSpacingTooltip from '../Shared/MinimalSpacingTooltip';

const useStyles = makeStyles()((theme: Theme) => ({
  box: {
    width: '100%',
    height: '54px',
    border: '2px solid #999999',
    borderRadius: '50px',
    padding: '2px',
    position: 'relative',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
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
  inline: {
    display: 'inline',
  },
  belowDetails: { position: 'absolute', right: '5px' },
}));

interface Props {
  loading?: boolean;
  primary?: number;
  secondary?: number;
  receivedBelow?: string;
  committedBelow?: string;
}

const StyledProgress = ({
  loading,
  primary = 0,
  secondary = 0,
  receivedBelow = '',
  committedBelow = '',
}: Props): ReactElement => {
  const locale = useLocale();
  const { t } = useTranslation();
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
      <Box className={classes.belowDetails}>
        {receivedBelow && (
          <MinimalSpacingTooltip title={t('Received Below Goal')} arrow>
            <Typography className={classes.inline}>{receivedBelow}</Typography>
          </MinimalSpacingTooltip>
        )}
        {committedBelow && receivedBelow && (
          <Typography className={classes.inline}>{' / '}</Typography>
        )}
        {committedBelow && (
          <MinimalSpacingTooltip title={t('Committed Below Goal')} arrow>
            <Typography className={classes.inline}>{committedBelow}</Typography>
          </MinimalSpacingTooltip>
        )}
      </Box>
    </Box>
  );
};

export default StyledProgress;
