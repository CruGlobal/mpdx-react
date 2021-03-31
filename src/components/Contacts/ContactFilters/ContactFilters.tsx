import {
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  Typography,
} from '@material-ui/core';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactFilterGroup } from '../../../../graphql/types.generated';
import { Filter } from '../../Shared/Filters/Filter';
import { FilterListItem } from '../../Shared/Filters/FilterListItem';
import { FilterListItemShowAll } from '../../Shared/Filters/FilterListItemShowAll';
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

  const [selectedGroup, showGroup] = useState<null | ContactFilterGroup>(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showAll, setShowAll] = useState(false);

  const updateSelectedFilter = (name: string, value) => {
    if (value)
      setSelectedFilters((prev) => {
        return { ...prev, [name]: value };
      });
    else
      setSelectedFilters((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
  };

  const getSelectedFilters = (group: ContactFilterGroup) =>
    group.filters.filter((value) => selectedFilters[value.name]);

  useEffect(() => {
    loadContactFilters();
  }, []);

  return (
    <div>
      <div style={{ overflow: 'hidden' }}>
        <Slide
          in={selectedGroup == null}
          direction="right"
          appear={false}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <Box px={2} pt={2}>
              <Typography variant="h6">
                {Object.keys(selectedFilters).length > 0
                  ? t('Filter ({{count}})', {
                      count: Object.keys(selectedFilters).length,
                    })
                  : t('Filter')}
              </Typography>
            </Box>
            <List dense data-testID="FiltersList">
              {error && (
                <ListItem>
                  <ListItemText
                    primary={'Error: ' + error.toString()}
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
                <>
                  {data?.contactFilters?.map((group: ContactFilterGroup) => (
                    <Collapse
                      key={group.id}
                      in={
                        showAll ||
                        group.alwaysVisible ||
                        getSelectedFilters(group).length > 0
                      }
                    >
                      <ListItem button onClick={() => showGroup(group)}>
                        <ListItemText
                          primary={group.title}
                          primaryTypographyProps={{ variant: 'subtitle1' }}
                        />
                        <ArrowForwardIos fontSize="small" color="disabled" />
                      </ListItem>
                    </Collapse>
                  ))}
                  <FilterListItemShowAll
                    showAll={showAll}
                    onToggle={() => setShowAll(!showAll)}
                  />
                </>
              )}
            </List>
          </div>
        </Slide>
        <Slide
          in={selectedGroup != null}
          direction="left"
          mountOnEnter
          unmountOnExit
        >
          <List dense data-testID="FiltersList">
            <ListItem button onClick={() => showGroup(null)}>
              <ListItemIcon>
                <ArrowBackIos fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={selectedGroup?.title}
                primaryTypographyProps={{ variant: 'h6' }}
              />
            </ListItem>
            {selectedGroup?.filters?.map((filter) => (
              <FilterListItem
                key={filter.id}
                filter={filter as Filter}
                value={selectedFilters[filter.name]}
                onUpdate={(value) => updateSelectedFilter(filter.name, value)}
              />
            ))}
          </List>
        </Slide>
      </div>
    </div>
  );
};
