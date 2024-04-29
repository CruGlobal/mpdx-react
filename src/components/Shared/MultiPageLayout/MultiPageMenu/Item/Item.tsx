import NextLink from 'next/link';
import React, { useMemo, useState } from 'react';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { Collapse, ListItem, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';
import HandoffLink from 'src/components/HandoffLink';
import { useAccountListId } from 'src/hooks/useAccountListId';
import theme from 'src/theme';
import { NavTypeEnum } from '../MultiPageMenu';
import { NavItems } from '../MultiPageMenuItems';

interface Props {
  item: NavItems;
  selectedId: string;
  navType: NavTypeEnum;
}

export const Item: React.FC<Props> = ({
  item,
  selectedId,
  navType,
  ...rest
}) => {
  const accountListId = useAccountListId();
  const [openSubMenu, setOpenSubMenu] = useState(false);
  const { t } = useTranslation();

  const isSelected = useMemo(() => {
    if (item.id === selectedId) return true;
    if (!item?.subItems?.length) return false;
    return !!item.subItems.find((item) => item.id === selectedId)?.id;
  }, [item]);

  const handleClick = () => {
    if (isSelected) return;
    if (!item?.subItems?.length) return;
    setOpenSubMenu(!openSubMenu);
  };

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
      <ArrowForwardIos
        fontSize="small"
        color="disabled"
        onClick={handleClick}
        style={
          (openSubMenu || isSelected) && item?.subItems?.length
            ? {
                transform: 'rotate(90deg)',
              }
            : {}
        }
      />
    </ListItem>
  );

  return (
    <>
      {item.handoff && (
        <HandoffLink path={item.id} auth={item.handoffAuth}>
          {children}
        </HandoffLink>
      )}
      {!item.handoff && (
        <NextLink
          href={`/accountLists/${accountListId}/${navType}/${item.id}`}
          scroll={false}
        >
          {children}
        </NextLink>
      )}
      {item?.subItems?.length && (
        <Collapse
          in={openSubMenu || isSelected}
          timeout="auto"
          unmountOnExit
          style={{
            background: theme.palette.cruGrayLight.main,
          }}
        >
          {item.subItems.map((subItem) => {
            return (
              <Item
                key={subItem.id}
                item={subItem}
                selectedId={selectedId}
                navType={navType}
              />
            );
          })}
        </Collapse>
      )}
    </>
  );
};
