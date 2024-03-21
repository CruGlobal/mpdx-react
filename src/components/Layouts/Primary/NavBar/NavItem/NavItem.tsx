import NextLink, { LinkProps } from 'next/link';
import React, { useState } from 'react';
import type { FC, ReactNode } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Button, Collapse, ListItemButton } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import HandoffLink from 'src/components/HandoffLink';
import { LeafButton, LeafListItem, Title } from '../StyledComponents';

interface NavItemProps {
  children?: ReactNode;
  className?: string;
  depth?: number;
  href?: LinkProps['href'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  open?: boolean;
  title: string;
}

const StyledListItem = styled(ListItemButton)(() => ({
  display: 'block',
  paddingTop: 0,
  paddingBottom: 0,
}));

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
    fontSize: 18,
    marginRight: theme.spacing(1.5),
  };

  if (children) {
    return (
      <StyledListItem disableGutters key={title} {...rest}>
        <StyledButton onClick={handleToggle} style={style}>
          {Icon && <Icon style={iconStyle} size="20" />}
          <Title>{title}</Title>
          {open ? (
            <ExpandItemIcon
              fontSize="small"
              color="disabled"
              titleAccess="Expand"
            />
          ) : (
            <CollapseItemIcon
              fontSize="small"
              color="disabled"
              titleAccess="Collapse"
            />
          )}
        </StyledButton>
        <Collapse in={open}>{children}</Collapse>
      </StyledListItem>
    );
  }

  return (
    <LeafListItem disableGutters key={title} {...rest}>
      {(href as string).includes('tools') ? (
        <HandoffLink key={title} path={href as string}>
          <LeafButton style={style}>
            {Icon && <Icon style={iconStyle} size="20" />}
            <Title>{title}</Title>
          </LeafButton>
        </HandoffLink>
      ) : (
        <NextLink href={href}>
          <LeafButton style={style}>
            {Icon && <Icon style={iconStyle} size="20" />}
            <Title>{title}</Title>
          </LeafButton>
        </NextLink>
      )}
    </LeafListItem>
  );
};
