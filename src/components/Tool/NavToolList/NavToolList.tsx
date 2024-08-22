import React, { Fragment, ReactElement } from 'react';
import Icon from '@mdi/react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Theme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { ToolsList } from '../Home/ToolList';
import { Item } from './Item/Item';

const useStyles = makeStyles()((theme: Theme) => ({
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

export interface Props {
  selectedId?: string;
}

const NavToolList = ({ selectedId }: Props): ReactElement => {
  const { classes } = useStyles();

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
              <Item
                key={tool.id}
                url={tool.url}
                title={tool.tool}
                isSelected={selectedId === tool.id}
              />
            ))}
          </Fragment>
        ))}
      </List>
    </Box>
  );
};

export default NavToolList;
