import React, { ReactElement } from 'react';
import { ListItem, ListItemText, makeStyles } from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import NextLink from 'next/link';
import theme from '../../../../theme';
import { useAccountListId } from 'src/hooks/useAccountListId';

const useStyles = makeStyles(() => ({
  liButton: {
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  liSelected: {
    backgroundColor: theme.palette.cruGrayLight.main,
  },
}));

interface Props {
  key?: string;
  id: string;
  title: string;
  isSelected: boolean;
}

export const Item = ({ id, title, isSelected }: Props): ReactElement => {
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
        className={isSelected ? classes.liSelected : classes.liButton}
      >
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={title}
        />
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
