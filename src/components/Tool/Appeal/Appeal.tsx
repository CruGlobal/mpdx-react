import {
  Box,
  CardContent,
  Typography,
  Tooltip,
  makeStyles,
  Theme,
} from '@material-ui/core';
import React, { ReactElement } from 'react';
import StarIcon from '@material-ui/icons/Star';
import StarOutlineIcon from '@material-ui/icons/StarOutline';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import theme from '../../../../src/theme';
import AnimatedCard from '../../../../src/components/AnimatedCard';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

export interface Props {
  name: string;
  id: string;
  primary: boolean;
  amount: number;
  amountCurrency: string;
  given: number;
  received: number;
  commited: number;
  total: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  cardContent: {
    marginTop: -theme.spacing(2),
  },
  starPrimary: {
    color: theme.palette.mpdxBlue.main,
    transform: `translateY(${theme.spacing(0.5)}px)`,
    '&:hover': {
      cursor: 'pointer',
      color: theme.palette.progressBarYellow.main,
    },
  },
  colorYellow: {
    color: theme.palette.progressBarYellow.main,
  },
  colorOrange: {
    color: theme.palette.progressBarOrange.main,
  },
  colorLightGray: {
    color: theme.palette.progressBarGray.main,
  },
  progressBarOuter: {
    backgroundColor: theme.palette.cruGrayDark.main,
    width: '100%',
    height: '30px',
    borderRadius: 10,
    padding: 3,
  },
  progressBarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflowX: 'hidden',
  },
  nameLink: {
    '& a': {
      textDecoration: 'none',
      color: theme.palette.mpdxBlue.main,
      '&:hover': {
        textDecoration: 'underline',
      },
    },
  },
}));

const Appeal = ({
  name,
  id,
  primary,
  amount,
  amountCurrency,
  given,
  received,
  commited,
}: Props): ReactElement => {
  const classes = useStyles();
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  return (
    <Box m={1}>
      <AnimatedCard>
        <CardContent className={classes.cardContent}>
          <Box display="flex" justifyContent="space-between">
            <Typography
              variant="h6"
              display="inline"
              className={classes.nameLink}
            >
              <NextLink
                href={`/accountLists/${accountListId}/tools/appeals/${id}`}
                scroll={false}
              >
                {name}
              </NextLink>
            </Typography>
            <Box>
              <Typography variant="h6" display="inline">
                {given.toFixed(2)} / {amount.toFixed(2)}
              </Typography>
              {primary ? (
                <StarIcon className={classes.starPrimary} />
              ) : (
                <StarOutlineIcon className={classes.starPrimary} />
              )}
            </Box>
          </Box>
          <Box display="flex" justifyContent="end">
            <Tooltip title={t('Given').toString()} placement="top" arrow>
              <Typography
                variant="body2"
                display="inline"
                className={classes.colorYellow}
              >
                {given} {amountCurrency} (
                {`${((given / (amount || 1)) * 100).toFixed(0)}%`})
              </Typography>
            </Tooltip>
            <Typography
              variant="body2"
              display="inline"
              style={{
                padding: '0 3px 0 3px',
              }}
            >
              /
            </Typography>
            <Tooltip title={t('Received').toString()} placement="top" arrow>
              <Typography
                variant="body2"
                display="inline"
                className={classes.colorOrange}
              >
                {received + given} {amountCurrency} (
                {`${(((received + given) / (amount || 1)) * 100).toFixed(0)}%`})
              </Typography>
            </Tooltip>
            <Typography
              variant="body2"
              display="inline"
              style={{
                padding: '0 3px 0 3px',
              }}
            >
              /
            </Typography>
            <Tooltip title={t('Commited').toString()} placement="top" arrow>
              <Typography
                variant="body2"
                display="inline"
                className={classes.colorLightGray}
              >
                {commited + received + given} {amountCurrency} (
                {`${(
                  ((commited + received + given) / (amount || 1)) *
                  100
                ).toFixed(0)}%`}
                )
              </Typography>
            </Tooltip>
          </Box>
          <Box className={classes.progressBarOuter}>
            <Box
              display="flex"
              justifyContent="flex-start"
              className={classes.progressBarInner}
            >
              <Tooltip
                title={t('Given').toString()}
                placement="top-start"
                arrow
              >
                <Box
                  style={{
                    minWidth: `min(${(given / (amount || 1)) * 100}%,100%)`,
                    height: '100%',
                    backgroundColor: theme.palette.progressBarYellow.main,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    borderTopRightRadius: !received && !commited ? 8 : 0,
                    borderBottomRightRadius: !received && !commited ? 8 : 0,
                  }}
                />
              </Tooltip>
              <Tooltip
                title={t('Received').toString()}
                placement="top-start"
                arrow
              >
                <Box
                  style={{
                    minWidth: `${(received / (amount || 1)) * 100}%`,
                    height: '100%',
                    backgroundColor: theme.palette.progressBarOrange.main,
                    borderTopLeftRadius: !given ? 8 : 0,
                    borderBottomLeftRadius: !given ? 8 : 0,
                    borderTopRightRadius: !commited ? 8 : 0,
                    borderBottomRightRadius: !commited ? 8 : 0,
                  }}
                />
              </Tooltip>
              <Tooltip
                title={t('Commited').toString()}
                placement="top-start"
                arrow
              >
                <Box
                  style={{
                    minWidth: `${(commited / (amount || 1)) * 100}%`,
                    height: '100%',
                    backgroundColor: theme.palette.progressBarGray.main,
                    borderTopLeftRadius: !given && !received ? 8 : 0,
                    borderBottomLeftRadius: !given && !received ? 8 : 0,
                    borderTopRightRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                ></Box>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </AnimatedCard>
    </Box>
  );
};

export default Appeal;
