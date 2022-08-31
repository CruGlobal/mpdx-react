import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import { ArrowForwardIos } from '@mui/icons-material';
import NextLink from 'next/link';
import { useAccountListId } from 'src/hooks/useAccountListId';

interface ReportOption {
  id: string;
  title: string;
  subTitle?: string;
}

interface Props {
  item: ReportOption;
  isSelected: boolean;
}

export const Item: React.FC<Props> = ({ item, isSelected, ...rest }) => {
  const accountListId = useAccountListId();

  return (
    <NextLink
      href={`/accountLists/${accountListId}/reports/${item.id}`}
      scroll={false}
    >
      <ListItem button selected={isSelected} {...rest}>
        <ListItemText
          primaryTypographyProps={{
            variant: 'subtitle1',
            color: 'textPrimary',
          }}
          primary={item.title}
          secondary={item.subTitle}
        />
        <ArrowForwardIos fontSize="small" color="disabled" />
      </ListItem>
    </NextLink>
  );
};
