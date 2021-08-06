import React, { ReactElement } from 'react';
import { ListItem, ListItemText, makeStyles, Theme } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

const useStyles = makeStyles((theme: Theme) => ({
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
  key: string;
  id: string;
  title: string;
  isSelected: boolean;
}

export const Item = ({ id, title, isSelected }: Props): ReactElement => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
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
          primary={t(title)}
        />
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
