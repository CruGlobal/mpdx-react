import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface ToolOption {
  id: string;
  title: string;
  subTitle?: string;
}

interface Props {
  item: ToolOption;
  isSelected: boolean;
}

export const Item: React.FC<Props> = ({ item, isSelected, ...rest }) => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  return (
    <NextLink
      href={`/accountLists/${accountListId}/tools/${item.id}`}
      scroll={false}
    >
      <ListItem button selected={isSelected} {...rest}>
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={t(item.title)}
          secondary={t(item.subTitle)}
        />
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
