import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import Icon from '@mdi/react';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {
  Box,
  ClickAwayListener,
  Grid,
  Grow,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { NavPage } from 'src/hooks/useNavPages';
import { useCurrentToolId } from '../../../../../../hooks/useCurrentToolId';
import { useStyles } from './NavMenu';

interface NavMenuDropdownProps {
  page: NavPage;
  menuOpen: boolean;
  handleMenuToggle: () => void;
  handleMenuClose: () => void;
  testId: string;
  sum: number;
  toolData: Record<string, { totalCount: number }>;
  loading: boolean;
  isTool: boolean;
}

export const NavMenuDropdown: React.FC<NavMenuDropdownProps> = ({
  page,
  menuOpen,
  handleMenuToggle,
  handleMenuClose,
  testId,
  sum,
  toolData,
  loading,
  isTool,
}) => {
  const { t } = useTranslation();
  const { classes } = useStyles();
  const { pathname } = useRouter();
  const currentToolId = useCurrentToolId();

  const anchorRef = React.useRef<HTMLLIElement>(null);

  return (
    <Grid key={page.id} item className={classes.navListItem}>
      <MenuItem
        tabIndex={0}
        ref={anchorRef}
        aria-controls={menuOpen ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleMenuToggle}
        data-testid={testId}
        aria-expanded={menuOpen}
        className={clsx(
          classes.menuItem,
          menuOpen && classes.menuItemSelected,
          pathname.startsWith(page.pathname ?? '') && classes.menuItemSelected,
        )}
      >
        <ListItemText primary={page.title} />
        {isTool && sum > 0 && (
          <Box
            className={classes.notificationBox}
            data-testid="notificationTotal"
          >
            <Typography data-testid="notificationTotalText">
              {sum < 100 ? sum : '99+'}
            </Typography>
          </Box>
        )}
        <ArrowDropDownIcon
          className={clsx(classes.expand, {
            [classes.expandOpen]: menuOpen,
          })}
        />
      </MenuItem>
      <Popper
        open={menuOpen}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            {isTool ? (
              <Paper className={classes.subMenu}>
                <ClickAwayListener onClickAway={handleMenuClose}>
                  <MenuList autoFocusItem={menuOpen} id="menu-list-grow">
                    {page.items?.map((tool) => {
                      const needsAttention = toolData
                        ? toolData[tool.id]?.totalCount > 0
                        : false;
                      return (
                        <MenuItem
                          key={tool.id}
                          component={NextLink}
                          href={tool.href ?? ''}
                          tabIndex={0}
                          onClick={handleMenuClose}
                          data-testid={`${tool.id}-${
                            currentToolId === tool.id
                          }`}
                          aria-current={
                            pathname.startsWith(tool.href?.toString() ?? '')
                              ? 'page'
                              : undefined
                          }
                          className={clsx(
                            classes.menuItem,
                            needsAttention && classes.needsAttention,
                          )}
                        >
                          {tool.icon && (
                            <Icon
                              path={tool.icon}
                              size={1}
                              className={clsx(
                                classes.menuIcon,
                                needsAttention
                                  ? classes.darkText
                                  : classes.whiteText,
                              )}
                            />
                          )}
                          <ListItemText
                            className={clsx(
                              needsAttention
                                ? classes.darkText
                                : classes.whiteText,
                            )}
                            primary={tool.title}
                          />
                          {!loading && needsAttention && (
                            <Box
                              className={classes.notificationBox}
                              data-testid={`${tool.id}-notifications`}
                            >
                              <Typography>
                                {toolData[tool.id].totalCount < 100
                                  ? toolData[tool.id].totalCount
                                  : '99+'}
                              </Typography>
                            </Box>
                          )}
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            ) : (
              <Paper>
                <ClickAwayListener onClickAway={handleMenuClose}>
                  <MenuList autoFocusItem={menuOpen} id="menu-list-grow">
                    {page.items?.map(({ id, title, href }) => (
                      <MenuItem
                        key={id}
                        component={NextLink}
                        href={href ?? ''}
                        onClick={handleMenuClose}
                        tabIndex={0}
                        aria-current={
                          pathname.startsWith(href?.toString() ?? '')
                            ? 'page'
                            : undefined
                        }
                      >
                        <ListItemText primary={t(title)} />
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            )}
          </Grow>
        )}
      </Popper>
    </Grid>
  );
};
