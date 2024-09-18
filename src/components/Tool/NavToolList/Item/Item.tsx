import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { Box, ListItem, ListItemText, Theme, Typography } from '@mui/material';
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
  totalCount: number;
  toolId: string;
}

export const Item = ({
  url,
  title,
  isSelected,
  loading,
  totalCount,
  toolId,
}: Props): ReactElement => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  return (
    <NextLink
      href={`/accountLists/${accountListId}/tools/${url}`}
      scroll={false}
    >
      <ListItem button selected={isSelected}>
        <ListItemText
          data-testid={`${toolId}-list-item`}
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={title}
        />
        {!loading && !!totalCount && (
          <Box className={classes.notificationBox}>
            <Typography data-testid={`${toolId}-notifications`}>
              {totalCount < 10 ? totalCount : '9+'}
            </Typography>
          </Box>
        )}
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
