import React, { ReactElement } from 'react';
import {
  makeStyles,
  Box,
  Theme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import BuildIcon from '@material-ui/icons/Build';
import { useTranslation } from 'react-i18next';
import { ToolNavItems } from './ToolNavItems';
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

export interface Props {
  selectedId?: string;
}

const NavToolList = ({ selectedId }: Props): ReactElement => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Box component="div" className={classes.list}>
      <List>
        <ListItem className={classes.li}>
          <ListItemIcon>
            <BuildIcon />
          </ListItemIcon>
          <ListItemText primary={t('Tools')} />
        </ListItem>
        {ToolNavItems.slice(0, 1).map((tool) => (
          <Item
            key={tool.id}
            id={tool.id}
            title={tool.title}
            isSelected={selectedId === tool.id}
          />
        ))}
        <ListItem className={classes.li}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={t('Contacts')} />
        </ListItem>
        {ToolNavItems.slice(1, 5).map((tool) => (
          <Item
            key={tool.id}
            id={tool.id}
            title={tool.title}
            isSelected={selectedId === tool.id}
          />
        ))}
        <ListItem className={classes.li}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary={t('People')} />
        </ListItem>
        {ToolNavItems.slice(5, 8).map((tool) => (
          <Item
            key={tool.id}
            id={tool.id}
            title={tool.title}
            isSelected={selectedId === tool.id}
          />
        ))}
        <ListItem className={classes.li}>
          <ListItemIcon>
            <CloudUploadIcon />
          </ListItemIcon>
          <ListItemText primary={t('Imports')} />
        </ListItem>
        {ToolNavItems.slice(8).map((tool) => (
          <Item
            key={tool.id}
            id={tool.id}
            title={tool.title}
            isSelected={selectedId === tool.id}
          />
        ))}
      </List>
    </Box>
  );
};

export default NavToolList;
