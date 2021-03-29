import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Slide,
  Typography,
} from '@material-ui/core';
import {
  ArrowBackIos,
  ArrowForwardIos,
  ExpandLess,
  ExpandMore,
} from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContactFiltersLazyQuery } from './ContactFilters.generated';

interface Props {
  accountListId: string;
}

export const ContactFilters: React.FC<Props> = ({ accountListId }: Props) => {
  const [
    loadContactFilters,
    { data, loading, error },
  ] = useContactFiltersLazyQuery({ variables: { accountListId } });
  const { t } = useTranslation();

  const [showAll, setShowAll] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState<null | string>(null);

  useEffect(() => {
    loadContactFilters();
  }, []);

  return (
    <div>
      <div style={{ overflow: 'hidden' }}>
        <Slide
          in={showSubMenu == null}
          direction="right"
          appear={false}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <Box px={2} pt={2}>
              <Typography variant="h6">{t('Filter')}</Typography>
            </Box>
            <List dense={true} data-testID="FiltersList">
              <ListItem button onClick={() => setShowSubMenu('tags')}>
                <ListItemText
                  primary="Tags"
                  primaryTypographyProps={{ variant: 'subtitle1' }}
                />
                <ArrowForwardIos fontSize="small" color="disabled" />
              </ListItem>
              <ListItem button onClick={() => setShowSubMenu('other')}>
                <ListItemText
                  primary="Other"
                  primaryTypographyProps={{ variant: 'subtitle1' }}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete">
                    <ArrowForwardIos fontSize="small" color="disabled" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <ListItem button onClick={() => setShowAll(!showAll)}>
                <ListItemText
                  color="primary"
                  primary={showAll ? 'See Fewer Filters' : 'See More Filters'}
                  primaryTypographyProps={{
                    color: 'primary',
                    variant: 'subtitle1',
                  }}
                />
                {showAll ? (
                  <ExpandLess color="primary" />
                ) : (
                  <ExpandMore color="primary" />
                )}
              </ListItem>
            </List>
          </div>
        </Slide>
        <Slide
          in={showSubMenu != null}
          direction="left"
          mountOnEnter
          unmountOnExit
        >
          <List dense={true} data-testID="FiltersList">
            <ListItem button onClick={() => setShowSubMenu(null)}>
              <ListItemIcon>
                <ArrowBackIos fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Tags"
                primaryTypographyProps={{ variant: 'h6' }}
              />
            </ListItem>
            {error && (
              <ListItem>
                <ListItemText
                  primary="Error: {error.toString()}"
                  primaryTypographyProps={{
                    variant: 'subtitle1',
                    color: 'error',
                  }}
                />
              </ListItem>
            )}
            {loading ? (
              <ListItem>
                <CircularProgress />
              </ListItem>
            ) : (
              data?.contactFilters?.map(({ id, title, featured }) => (
                <Collapse key={id} in={showAll || featured}>
                  <ListItem>
                    <ListItemText
                      primary={title}
                      primaryTypographyProps={{ variant: 'subtitle1' }}
                    />
                  </ListItem>
                </Collapse>
              ))
            )}
          </List>
        </Slide>
      </div>
    </div>
  );
};
