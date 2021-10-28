import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
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
import { ArrowBackIos, ArrowForwardIos, Close } from '@material-ui/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterListItem } from '../../Shared/Filters/FilterListItem';
import { FilterListItemShowAll } from '../../Shared/Filters/FilterListItemShowAll';
import {
  ContactFilterSetInput,
  FilterGroup,
} from '../../../../graphql/types.generated';
import { useContactFiltersQuery } from './ContactFilters.generated';

export type ContactFilterKey = keyof ContactFilterSetInput;
export type ContactFilterValue = ContactFilterSetInput[ContactFilterKey];

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

interface Props {
  accountListId: string;
  onClose: () => void;
  selectedFilters: ContactFilterSetInput;
  onSelectedFiltersChanged: (selectedFilters: ContactFilterSetInput) => void;
}

export const ContactFilters: React.FC<Props & BoxProps> = ({
  accountListId,
  onClose,
  selectedFilters,
  onSelectedFiltersChanged,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const { data, loading, error } = useContactFiltersQuery({
    variables: { accountListId },
  });

  const [selectedGroup, setSelectedGroup] = useState<FilterGroup>();
  const [showAll, setShowAll] = useState(false);

  const updateSelectedFilter = (
    name: ContactFilterKey,
    value?: ContactFilterValue,
  ) => {
    if (value) {
      const newFilters: ContactFilterSetInput = {
        ...selectedFilters,
        [name]: value,
      };
      onSelectedFiltersChanged(newFilters);
    } else {
      const newFilters: ContactFilterSetInput = { ...selectedFilters };
      delete newFilters[name];

      onSelectedFiltersChanged(newFilters);
    }
  };

  const clearSelectedFilter = () => {
    onSelectedFiltersChanged({});
  };

  const getSelectedFilters = (group: FilterGroup) =>
    group.filters.filter((value) => {
      const key = snakeToCamel(value.filterKey) as ContactFilterKey;

      return selectedFilters[key];
    });

  const getOptionsSelected = (group: FilterGroup) =>
    getSelectedFilters(group).flatMap(
      (f) => selectedFilters[snakeToCamel(f.filterKey) as ContactFilterKey],
    );

  const getFeaturedFilters = (group: FilterGroup) =>
    group.filters.filter((value) => value.featured);

  const isGroupVisible = (group: FilterGroup) =>
    getSelectedFilters(group).length > 0 ||
    getFeaturedFilters(group).length > 0;

  const selectedFilterCount = Object.values(selectedFilters).filter(
    (filter) => !(Array.isArray(filter) && filter.length === 0),
  ).length;

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
                  {selectedFilterCount > 0
                    ? t('Filter ({{count}})', {
                        count: selectedFilterCount,
                      })
                    : t('Filter')}
                </Typography>
                <IconButton onClick={onClose}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
              <LinkButton
                color="primary"
                style={{ marginInlineStart: theme.spacing(-1) }}
                disabled={Object.keys(selectedFilters).length === 0}
              >
                {t('Save (TODO)')}
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
              ) : data?.accountList.contactFilterGroups.length === 0 ? (
                <ListItem data-testid="NoFiltersState">
                  <ListItemText
                    primary={t('No Contact Filters Found')}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ) : (
                <>
                  <Typography>{JSON.stringify(selectedFilters)}</Typography>
                  {data?.accountList.contactFilterGroups.map((group) => {
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
                  {data?.accountList.contactFilterGroups.some(
                    (g) => !isGroupVisible(g),
                  ) ? (
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
                const filterKey = snakeToCamel(
                  filter.filterKey,
                ) as ContactFilterKey;

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
