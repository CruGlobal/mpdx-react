import NextLink, { LinkProps } from 'next/link';
import React, { useState } from 'react';
import type { FC, ReactNode } from 'react';
import Icon from '@mdi/react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Button, Collapse, ListItem } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { LeafListItem, Title } from '../StyledComponents';

interface NavItemProps {
  children?: ReactNode;
  className?: string;
  depth?: number;
  href?: LinkProps['href'];
  icon?: string;
  open?: boolean;
  title: string;
  whatsNewLink?: boolean;
}

const StyledListItem = styled(ListItem)({
  display: 'block',
  paddingTop: 0,
  paddingBottom: 0,
});

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: '10px 8px',
  justifyContent: 'flex-start',
  alignItems: 'center',
  textTransform: 'none',
  letterSpacing: 0,
  width: '100%',
}));

const ExpandItemIcon = styled(ExpandLessIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
}));

const CollapseItemIcon = styled(ChevronRightIcon)(({ theme }) => ({
  color: theme.palette.cruGrayMedium.main,
}));

export const NavItem: FC<NavItemProps> = ({
  children,
  depth = 0,
  href = '',
  icon,
  open: openProp,
  title,
  whatsNewLink,
  ...rest
}) => {
  const [open, setOpen] = useState<boolean>(openProp ?? false);
  const theme = useTheme();
  const { t } = useTranslation();

  const handleToggle = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };
  const style = {
    paddingLeft: depth > 0 ? 32 + 8 * depth : 8,
    paddingTop: 11,
    paddingBottom: 11,
    width: '100%',
  };
  const iconStyle = {
    color: theme.palette.common.white,
    fontSize: 18,
    marginRight: theme.spacing(1.5),
  };

  if (children) {
    return (
      <StyledListItem disableGutters key={title} {...rest}>
        <StyledButton onClick={handleToggle} style={style}>
          {icon && <Icon path={icon} style={iconStyle} size="20" />}
          <Title>{title}</Title>
          {open ? (
            <ExpandItemIcon
              fontSize="small"
              color="disabled"
              titleAccess={t('Expand')}
            />
          ) : (
            <CollapseItemIcon
              fontSize="small"
              color="disabled"
              titleAccess={t('Collapse')}
            />
          )}
        </StyledButton>
        <Collapse in={open}>{children}</Collapse>
      </StyledListItem>
    );
  }

  return (
    <LeafListItem
      disableGutters
      key={title}
      component={NextLink}
      href={href}
      style={style}
      {...rest}
    >
      {icon && <Icon path={icon} style={iconStyle} size="20" />}
      {whatsNewLink && process.env.HELP_WHATS_NEW_IMAGE_URL && (
        <img
          src={process.env.HELP_WHATS_NEW_IMAGE_URL}
          alt={t('Help logo')}
          height={24}
          style={{ marginRight: theme.spacing(1) }}
        />
      )}
      <Title>{title}</Title>
    </LeafListItem>
  );
};
