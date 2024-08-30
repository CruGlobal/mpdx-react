import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { Box, ListItem, ListItemText, Theme, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { useAccountListId } from 'src/hooks/useAccountListId';

const useStyles = makeStyles()((theme: Theme) => ({
  notificationBox: {
    backgroundColor: theme.palette.progressBarYellow.main,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: '25%',
    color: theme.palette.common.white,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing(2),
  },
}));

interface Props {
  key?: string;
  url: string;
  title: string;
  isSelected: boolean;
  loading: boolean;
  needsAttention: boolean;
  totalCount: number;
}

export const Item = ({
  url,
  title,
  isSelected,
  loading,
  needsAttention,
  totalCount,
}: Props): ReactElement => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  return (
    <NextLink
      href={`/accountLists/${accountListId}/tools/${url}`}
      scroll={false}
    >
      <ListItem button selected={isSelected}>
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={t(title)}
        />
        {!loading && needsAttention && (
          <Box
            className={classes.notificationBox}
            data-testid={`${title}-notifications`}
          >
            <Typography>{totalCount < 10 ? totalCount : '9+'}</Typography>
          </Box>
        )}
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
