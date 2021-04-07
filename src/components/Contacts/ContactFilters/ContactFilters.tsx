import {
  Box,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Slide,
  styled,
  Typography,
} from '@material-ui/core';
import { ArrowBackIos, ArrowForwardIos } from '@material-ui/icons';
import { isArray } from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContactFilterGroup } from '../../../../graphql/types.generated';
import { Filter } from '../../Shared/Filters/Filter';
import { FilterListItem } from '../../Shared/Filters/FilterListItem';
import { FilterListItemShowAll } from '../../Shared/Filters/FilterListItemShowAll';
import { useContactFiltersQuery } from './ContactFilters.generated';

const FilterList = styled(List)(() => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: '32px',
  },
}));

interface Props {
  accountListId: string;
  width?: any;
}

export const ContactFilters: React.FC<Props> = ({
  accountListId,
  width,
}: Props) => {
  const { data, loading, error } = useContactFiltersQuery({
    variables: { accountListId },
  });
  const { t } = useTranslation();

  const [selectedGroup, showGroup] = useState<null | ContactFilterGroup>(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showAll, setShowAll] = useState(false);

  const updateSelectedFilter = (name: string, value) => {
    if (value && !(isArray(value) && value.length == 0))
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
  const isGroupVisible = (group: ContactFilterGroup) =>
    group.alwaysVisible || getSelectedFilters(group).length > 0;

  return (
    <Box width={width}>
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
            <FilterList dense>
              {error && (
                <ListItem data-testid="ErrorState">
                  <ListItemText
                    primary={error.toString()}
                    primaryTypographyProps={{
                      variant: 'subtitle1',
                      color: 'error',
                    }}
                  />
                </ListItem>
              )}
              {loading ? (
                <ListItem data-testid="LoadingState">
                  <CircularProgress />
                </ListItem>
              ) : (
                <>
                  {data?.contactFilters?.map((group: ContactFilterGroup) => (
                    <Collapse
                      key={group.id}
                      in={showAll || isGroupVisible(group)}
                      data-testid="FilterGroup"
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
                  {data?.contactFilters?.some(
                    (g: ContactFilterGroup) => !isGroupVisible(g),
                  ) == true ? (
                    <FilterListItemShowAll
                      showAll={showAll}
                      onToggle={() => setShowAll(!showAll)}
                    />
                  ) : null}
                </>
              )}
            </FilterList>
          </div>
        </Slide>
        <Slide
          in={selectedGroup != null}
          direction="left"
          mountOnEnter
          unmountOnExit
        >
          <FilterList dense>
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
          </FilterList>
        </Slide>
      </div>
    </Box>
  );
};
