import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import NextLink from 'next/link';
import { useApp } from 'src/components/App';

export interface ReportOption {
  id: string;
  title: string;
  subTitle?: string | undefined;
}

interface Props {
  item: ReportOption;
  isSelected: boolean;
}

const NavReportListItem: React.FC<Props> = ({ item, isSelected, ...rest }) => {
  const { state } = useApp();

  return (
    <NextLink
      href={`/accountLists/${state.accountListId}/reports/${item.id}`}
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

export default NavReportListItem;
