import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { ListItem, ListItemText } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from '../../../../theme';

const useStyles = makeStyles()(() => ({
  liButton: {
    '&:hover': {
      backgroundColor: theme.palette.cruGrayLight.main,
    },
  },
  liSelected: {
    backgroundColor: 'green',
  },
}));

interface Props {
  key?: string;
  url: string;
  title: string;
  isSelected: boolean;
}

export const Item = ({ url, title, isSelected }: Props): ReactElement => {
  const accountListId = useAccountListId();
  const { classes } = useStyles();

  return (
    <NextLink
      href={`/accountLists/${accountListId}/tools/${url}`}
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
