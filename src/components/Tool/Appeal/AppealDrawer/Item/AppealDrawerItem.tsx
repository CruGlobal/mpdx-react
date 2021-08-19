import React, { ReactElement } from 'react';
import { ListItem, ListItemText, makeStyles, Box } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import NextLink from 'next/link';
import clsx from 'clsx';
import { useAccountListId } from '../../../../../hooks/useAccountListId';
import theme from '../../../../../theme';

const useStyles = makeStyles(() => ({
  li: {
    borderBottom: '1px solid black',
  },
  liButton: {
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  liSelected: {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
  red: {
    backgroundColor: 'red',
  },
  green: {
    backgroundColor: theme.palette.mpdxGreen.main,
  },
  gold: {
    backgroundColor: theme.palette.cruYellow.main,
    color: theme.palette.cruGrayDark.main + ' !important',
  },
  gray: {
    backgroundColor: theme.palette.cruGrayMedium.main,
  },
  valueText: {
    color: 'white',
    borderRadius: 5,
    padding: '2px 8px 2px 8px',
  },
}));

interface Props {
  id: string;
  title: string;
  isSelected: boolean;
  value: number;
}

export const AppealDrawerItem = ({
  id,
  title,
  isSelected,
  value,
}: Props): ReactElement => {
  const accountListId = useAccountListId();
  const classes = useStyles();

  return (
    <NextLink
      href={`/accountLists/${accountListId}/tools/${id}`}
      scroll={false}
    >
      <ListItem
        button
        selected={isSelected}
        className={clsx(
          classes.li,
          isSelected ? classes.liSelected : classes.liButton,
        )}
      >
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={title}
        />
        <Box
          className={clsx(
            classes.valueText,
            id === 'excluded'
              ? classes.red
              : id === 'asked'
              ? classes.gray
              : value > 0
              ? classes.gold
              : classes.green,
          )}
        >
          {value}
        </Box>
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
