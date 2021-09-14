import React, { useState } from 'react';
import type { FC, ReactNode } from 'react';
import NextLink from 'next/link';
import {
  Button,
  Collapse,
  ListItem,
  styled,
  useTheme,
} from '@material-ui/core';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

interface NavItemProps {
  children?: ReactNode;
  className?: string;
  depth: number;
  href?: string;
  as?: string;
  icon?: ReactNode;
  open?: boolean;
  title: string;
}

const StyledListItem = styled(ListItem)(() => ({
  display: 'block',
  paddingTop: 0,
  paddingBottom: 0,
}));

const LeafListItem = styled(ListItem)(() => ({
  display: 'flex',
  paddingTop: 0,
  paddingBottom: 0,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: '10px 8px',
  justifyContent: 'flex-start',
  textTransform: 'none',
  letterSpacing: 0,
  width: '100%',
}));

const LeafButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.secondary,
  padding: '10px 8px',
  justifyContent: 'flex-start',
  textTransform: 'none',
  letterSpacing: 0,
  width: '100%',
}));

const Title = styled('span')(({ theme }) => ({
  color: theme.palette.common.white,
  fontSize: 16,
  marginRight: 'auto',
}));

export const NavItem: FC<NavItemProps> = ({
  children,
  depth,
  href = '',
  as,
  icon: Icon,
  open: openProp,
  title,
  ...rest
}) => {
  const [open, setOpen] = useState<boolean>(openProp ?? false);
  const theme = useTheme();

  const handleToggle = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  let paddingLeft = 8;

  if (depth > 0) {
    paddingLeft = 32 + 8 * depth;
  }

  const style = { paddingLeft, paddingTop: 11, paddingBottom: 11 };
  const iconStyle = {
    color: theme.palette.common.white,
    fontSize: 16,
    marginRight: 'auto',
  };

  if (children) {
    return (
      <StyledListItem button disableGutters key={title} {...rest}>
        <StyledButton onClick={handleToggle} style={style}>
          {Icon && <Icon style={iconStyle} size="20" />}
          <Title>{title}</Title>
          {open ? (
            <ExpandLessIcon fontSize="small" color="disabled" />
          ) : (
            <ChevronRightIcon fontSize="small" color="disabled" />
          )}
        </StyledButton>
        <Collapse in={open}>{children}</Collapse>
      </StyledListItem>
    );
  }

  return (
    <LeafListItem button disableGutters key={title} {...rest}>
      <NextLink href={href} as={as}>
        <LeafButton style={style}>
          {Icon && <Icon style={iconStyle} size="20" />}
          <Title>{title}</Title>
        </LeafButton>
      </NextLink>
    </LeafListItem>
  );
};
