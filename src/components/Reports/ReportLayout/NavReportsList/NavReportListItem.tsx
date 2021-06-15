import React from 'react';
import { ListItem, ListItemProps, ListItemText } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import { NextLinkComposed } from 'src/components/Link';
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

const NavReportListItem: React.FC<Props & ListItemProps> = ({
  item,
  isSelected,
  ...ListItemProps
}) => {
  const { state } = useApp();

  return (
    <ListItem
      component={NextLinkComposed}
      selected={isSelected}
      to={{
        pathname: `/accountLists/${state.accountListId}/reports/${item.id}`,
      }}
      noLinkStyle
      {...ListItemProps}
    >
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
  );
};

export default NavReportListItem;
