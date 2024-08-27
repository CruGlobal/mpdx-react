import React, { Fragment, ReactElement } from 'react';
import Icon from '@mdi/react';
import {
  Box,
  Drawer,
  Grid,
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
  listContainer: {
    zIndex: 10,
  },
  list: {
    width: '290px',
  },
  li: {
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
  },
}));

export interface Props {
  selectedId?: string;
  open?: boolean;
  toggle: (isOpen: boolean) => void;
}

const NavToolList = ({ selectedId, open, toggle }: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <Grid container className={classes.listContainer}>
      <Drawer
        style={{ zIndex: 730 }}
        anchor={'left'}
        variant="persistent"
        open={open}
        onClose={() => toggle(false)}
      >
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
      </Drawer>
    </Grid>
  );
};

export default NavToolList;
