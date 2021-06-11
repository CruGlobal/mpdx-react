import React from 'react';
import { ListItem, ListItemProps, ListItemText } from '@material-ui/core';
import { ArrowForwardIos } from '@material-ui/icons';
import Link from 'src/components/Link';

export interface ReportOption {
  id: string;
  href: string;
  title: string;
  subTitle?: string | undefined;
}

interface Props {
  item: ReportOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const NavReportListItem: React.FC<Props & ListItemProps> = ({
  item,
  isSelected,
  onSelect,
  ...rest
}) => {
  return (
    <ListItem
      component={Link}
      selected={isSelected}
      href={item.href}
      noLinkStyle
      onClick={() => onSelect(item.id)}
      {...rest}
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
