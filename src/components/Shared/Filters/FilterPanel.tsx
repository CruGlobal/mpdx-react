import React, { useState } from 'react';
import {
  Box,
  BoxProps,
  Button,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  styled,
  Typography,
  useTheme,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ArrowBackIos, ArrowForwardIos, Close } from '@material-ui/icons';
import {
  ContactFilterSetInput,
  FilterGroup,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';
import { FilterPanelGroupFragment } from './FilterPanel.generated';
import { FilterListItemShowAll } from './FilterListItemShowAll';
import { FilterListItem } from './FilterListItem';

type ContactFilterKey = keyof ContactFilterSetInput;
type ContactFilterValue = ContactFilterSetInput[ContactFilterKey];
type TaskFilterKey = keyof TaskFilterSetInput;
type TaskFilterValue = TaskFilterSetInput[TaskFilterKey];
export type FilterKey = ContactFilterKey | TaskFilterKey;
export type FilterValue = ContactFilterValue | TaskFilterValue;

export const snakeToCamel = (inputKey: string): string => {
  const stringParts = inputKey.split('_');

  return stringParts.reduce((outputKey, part, index) => {
    if (index === 0) {
      return part;
    }

    return `${outputKey}${part.charAt(0).toUpperCase()}${part.slice(1)}`;
  }, '');
};

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
    marginBottom: theme.spacing(4),
  },
}));

const LinkButton = styled(Button)(() => ({
  minWidth: 0,
  textTransform: 'none',
}));

interface FilterPanelProps {
  filters: FilterPanelGroupFragment[];
  onClose: () => void;
  onSelectedFiltersChanged: (
    selectedFilters: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
}

export const FilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  filters,
  onClose,
  onSelectedFiltersChanged,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [selectedGroup, setSelectedGroup] = useState<FilterGroup>();
  const [selectedFilters, setSelectedFilters] = useState<
    ContactFilterSetInput & TaskFilterSetInput
  >({});
  const [showAll, setShowAll] = useState(false);
  const updateSelectedFilter = (name: FilterKey, value?: FilterValue) => {
    if (value) {
      const newFilters: ContactFilterSetInput & TaskFilterSetInput = {
        ...selectedFilters,
        [name]: value,
      };

      setSelectedFilters(newFilters);
      onSelectedFiltersChanged(newFilters);
    } else {
      const newFilters: ContactFilterSetInput & TaskFilterSetInput = {
        ...selectedFilters,
      };
      delete newFilters[name];

      setSelectedFilters(newFilters);
      onSelectedFiltersChanged(newFilters);
    }
  };
  const clearSelectedFilter = () => {
    setSelectedFilters({});
    onSelectedFiltersChanged({});
  };
  const getSelectedFilters = (group: FilterGroup) =>
    group.filters.filter((value) => {
      const key = snakeToCamel(value.filterKey) as FilterKey;

      return selectedFilters[key];
    });

  const getOptionsSelected = (group: FilterGroup) =>
    getSelectedFilters(group).flatMap(
      (f) => selectedFilters[snakeToCamel(f.filterKey) as FilterKey],
    );

  const getFeaturedFilters = (group: FilterGroup) =>
    group.filters.filter((value) => value.featured);

  const isGroupVisible = (group: FilterGroup) =>
    getSelectedFilters(group).length > 0 ||
    getFeaturedFilters(group).length > 0;

  return (
    <Box {...boxProps}>
      <div style={{ overflow: 'hidden' }}>
        <Slide
          in={!selectedGroup}
          direction="right"
          appear={false}
          mountOnEnter
          unmountOnExit
        >
          <div>
            <FilterHeader>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6">
                  {Object.keys(selectedFilters).length > 0
                    ? t('Filter ({{count}})', {
                        count: Object.keys(selectedFilters).length,
                      })
                    : t('Filter')}
                </Typography>
                <IconButton onClick={onClose} aria-label={t('Close')}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
              <LinkButton
                color="primary"
                style={{ marginInlineStart: theme.spacing(-1) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={() => alert('TODO')}
              >
                {t('Save')}
              </LinkButton>
              <LinkButton
                color="primary"
                style={{ marginInlineStart: theme.spacing(2) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={clearSelectedFilter}
              >
                {t('Clear All')}
              </LinkButton>
            </FilterHeader>
            <FilterList dense>
              {filters?.length === 0 ? (
                <ListItem data-testid="NoFiltersState">
                  <ListItemText
                    primary={t('No Filters Found')}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ) : (
                <>
                  {filters?.map((group) => {
                    const selectedOptions = getOptionsSelected(group);
                    return (
                      <Collapse
                        key={group.name}
                        in={showAll || isGroupVisible(group)}
                        data-testid="FilterGroup"
                      >
                        <ListItem
                          button
                          onClick={() => setSelectedGroup(group)}
                        >
                          <ListItemText
                            primary={`${group.name} ${
                              selectedOptions.length > 0
                                ? `(${selectedOptions.length})`
                                : ''
                            }`}
                            primaryTypographyProps={{ variant: 'subtitle1' }}
                          />
                          <ArrowForwardIos fontSize="small" color="disabled" />
                        </ListItem>
                      </Collapse>
                    );
                  })}
                  {filters?.some((g) => !isGroupVisible(g)) ? (
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
        <Slide in={!!selectedGroup} direction="left" mountOnEnter unmountOnExit>
          <div>
            <FilterHeader>
              <IconButton
                data-testid="CloseFilterGroupButton"
                size="small"
                edge="start"
                onClick={() => setSelectedGroup(undefined)}
                style={{ verticalAlign: 'middle' }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>
              <Typography
                variant="h6"
                component="span"
                style={{ verticalAlign: 'middle' }}
              >
                {selectedGroup?.name}
              </Typography>
            </FilterHeader>
            <FilterList dense>
              {selectedGroup?.filters?.map((filter) => {
                const filterKey = snakeToCamel(filter.filterKey) as FilterKey;

                return (
                  <FilterListItem
                    key={filterKey}
                    filter={filter}
                    value={selectedFilters[filterKey]}
                    onUpdate={(value) => updateSelectedFilter(filterKey, value)}
                  />
                );
              })}
            </FilterList>
          </div>
        </Slide>
      </div>
    </Box>
  );
};
