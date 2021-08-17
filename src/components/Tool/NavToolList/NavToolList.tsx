import React, { ReactElement, Fragment } from 'react';
import {
  makeStyles,
  Box,
  Theme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import Icon from '@mdi/react';
import { ToolsList } from '../Home/ToolList';
import { Item } from './Item/Item';

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    width: '290px',
    transform: 'translateY(55px)',
    [theme.breakpoints.down('xs')]: {
      transform: 'translateY(45px)',
    },
  },
  li: {
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
  },
}));

const NavToolList = (): ReactElement => {
  const classes = useStyles();

  return (
    <Box component="div" className={classes.list} data-testid="ToolNavList">
      <List>
        {ToolsList.map((group) => (
          <Fragment key={group.groupName}>
            <ListItem className={classes.li}>
              <ListItemIcon>
                <Icon path={group.groupIcon} size={1} />
              </ListItemIcon>
              <ListItemText primary={group.groupName} />
            </ListItem>
            {group.items.map((tool) => (
              <Item key={tool.id} id={tool.id} title={tool.tool} />
            ))}
          </Fragment>
        ))}
      </List>
    </Box>
  );
};

export default NavToolList;
