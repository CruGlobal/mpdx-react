import NextLink from 'next/link';
import React, { ReactElement } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { ListItem, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface Props {
  key?: string;
  url: string;
  title: string;
  isSelected: boolean;
}

export const Item = ({ url, title, isSelected }: Props): ReactElement => {
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
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
