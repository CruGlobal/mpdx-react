import React, { Fragment, ReactElement } from 'react';
import Icon from '@mdi/react';
import Close from '@mui/icons-material/Close';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  Theme,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';
import { ToolsList } from '../Home/ToolList';
import { Item } from './Item/Item';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    overflow: 'hidden',
  },
  listContainer: {
    zIndex: 10,
  },
  li: {
    borderTop: '1px solid',
    borderBottom: '1px solid',
    borderColor: theme.palette.cruGrayDark.main,
  },
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.grey[200],
}));

const FilterList = styled(List)(({ theme }) => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(2),
  },
}));

export interface Props {
  selectedId?: string;
  isOpen?: boolean;
  toggle: (isOpen: boolean) => void;
}

const NavToolList = ({ selectedId, isOpen, toggle }: Props): ReactElement => {
  const { classes } = useStyles();
  const { t } = useTranslation();

  return (
    <Box data-testid="MultiPageMenu">
      <div className={classes.root}>
        <Slide in={isOpen} direction="right" mountOnEnter unmountOnExit>
          <Box>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{t('Tools')}</Typography>
                <IconButton onClick={() => toggle(!isOpen)}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
            </FilterHeader>
            <FilterList dense>
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
            </FilterList>
          </Box>
        </Slide>
      </div>
    </Box>
  );
};

export default NavToolList;
