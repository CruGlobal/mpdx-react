import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import HandoffLink from 'src/components/HandoffLink';
import { NavTypeEnum } from '../MultiPageMenu';

interface ReportOption {
  id: string;
  title: string;
  subTitle?: string;
}

interface Props {
  item: ReportOption;
  isSelected: boolean;
  navType: NavTypeEnum;
}

export const Item: React.FC<Props> = ({
  item,
  isSelected,
  navType,
  ...rest
}) => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();

  const children = (
    <ListItem button selected={isSelected} {...rest}>
      <ListItemText
        primaryTypographyProps={{
          variant: 'subtitle1',
          color: 'textPrimary',
        }}
        primary={t(item.title)}
        secondary={item.subTitle ? t(item.subTitle) : undefined}
      />
      <ArrowForwardIos fontSize="small" color="disabled" />
    </ListItem>
  );

  if (item.id === 'coaching') {
    return <HandoffLink path={`/${navType}/coaching`}>{children}</HandoffLink>;
  } else {
    return (
      <NextLink
        href={`/accountLists/${accountListId}/${navType}/${item.id}`}
        scroll={false}
      >
        {children}
      </NextLink>
    );
  }
};
