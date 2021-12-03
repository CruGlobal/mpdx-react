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
import { filter } from 'lodash';
import {
  ContactFilterNewsletterEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  FilterGroup,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';
import {
  FilterPanelGroupFragment,
  UserOptionFragment,
} from './FilterPanel.generated';
import { FilterListItemShowAll } from './FilterListItemShowAll';
import { FilterListItem } from './FilterListItem';
import { SaveFilterModal } from './SaveFilterModal/SaveFilterModal';

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
  savedFilters: UserOptionFragment[];
  selectedFilters: ContactFilterSetInput & TaskFilterSetInput;
  onClose: () => void;
  onSelectedFiltersChanged: (
    selectedFilters: ContactFilterSetInput & TaskFilterSetInput,
  ) => void;
}

export const FilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  filters,
  savedFilters,
  onClose,
  selectedFilters,
  onSelectedFiltersChanged,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [selectedGroup, setSelectedGroup] = useState<FilterGroup>();
  const [savedFilterOpen, setSavedFilterOpen] = useState(false);
  const [saveFilterModalOpen, setSaveFilterModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const updateSelectedFilter = (name: FilterKey, value?: FilterValue) => {
    if (value) {
      const newFilters: ContactFilterSetInput & TaskFilterSetInput = {
        ...selectedFilters,
        [name]: value,
      };
      onSelectedFiltersChanged(newFilters);
    } else {
      const newFilters: ContactFilterSetInput & TaskFilterSetInput = {
        ...selectedFilters,
      };
      delete newFilters[name];

      onSelectedFiltersChanged(newFilters);
    }
  };
  const clearSelectedFilter = () => {
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

  const defaultFilters = ['anyTags', 'excludeTags', 'wildcardSearch'];

  const selectedFilterCount = Object.entries(selectedFilters).filter(
    ([key, value]) =>
      !defaultFilters.includes(key) &&
      !key.includes('reverse') &&
      value !== null &&
      !(Array.isArray(value) && filter.length === 0),
  ).length;

  const setSelectedSavedFilter = (filter: UserOptionFragment) => {
    if (filter.value) {
      // Clear current filters
      clearSelectedFilter();
      // Parse from string to json object
      const parsedFilter = JSON.parse(filter.value);

      if (filter.key?.includes('graphql_')) {
        // Clear current filters
        clearSelectedFilter();
        // Filter out accountListId from filter
        const newFilter = Object.keys(parsedFilter)
          .filter((key) => key !== 'accountListId')
          .reduce((res, key) => {
            return { ...res, [key]: parsedFilter[key] };
          }, {});
        // Set the selected filter with our saved filter data
        onSelectedFiltersChanged(newFilter);

        // close the saved filter panel
        setSavedFilterOpen(false);
        return;
      }
      // Map through keys to convert key to camel from snake
      const filters = Object.keys(parsedFilter).map(
        (key) =>
          ({
            name: snakeToCamel(key),
            value: parsedFilter[key],
          } as { name: string; value: FilterKey }),
      );

      const newFilter = filters.reduce<
        ContactFilterSetInput & TaskFilterSetInput
      >((acc, filter) => {
        if (filter.name === 'params') {
          const nonDefaultFilters = Object.entries(filter.value).reduce<
            ContactFilterSetInput & TaskFilterSetInput
          >((acc, [name, value]) => {
            const key = snakeToCamel(name) as FilterKey;
            switch (key) {
              // Boolean
              case 'addressHistoric':
              case 'addressValid':
              case 'noAppeals':
              case 'pledgeReceived':
              case 'reverseAlmaMater':
              case 'reverseAppeal':
              case 'reverseChurch':
              case 'reverseCity':
              case 'reverseCountry':
              case 'reverseDesignationAccountId':
              case 'reverseDonation':
              case 'reverseDonationAmount':
              case 'reverseIds':
              case 'reverseLikely':
              case 'reverseLocale':
              case 'reverseMetroArea':
              case 'reversePledgeAmount':
              case 'reversePledgeCurrency':
              case 'reversePledgeFrequency':
              case 'reversePrimaryAddress':
              case 'reverseReferrer':
              case 'reverseRegion':
              case 'reverseRelatedTaskAction':
              case 'reverseSource':
              case 'reverseState':
              case 'reverseStatus':
              case 'reverseTimezone':
              case 'reverseUserIds':
              case 'starred':
              case 'statusValid':
              case 'tasksAllCompleted':
                return { ...acc, [key]: value === 'true' };
              // DateRangeInput
              case 'donationDate':
              case 'createdAt':
              case 'anniversary':
              case 'birthday':
              case 'gaveMoreThanPledgedRange':
              case 'lateAt':
              case 'nextAsk':
              case 'pledgeAmountIncreasedRange':
              case 'startedGivingRange':
              case 'stoppedGivingRange':
              case 'taskDueDate':
              case 'updatedAt':
                const [min, max] = value.split('..');
                return {
                  ...acc,
                  [key]: {
                    min,
                    max,
                  },
                };
              // Multiselect
              case 'almaMater':
              case 'appeal':
              case 'church':
              case 'city':
              case 'country':
              case 'designationAccountId':
              case 'donation':
              case 'donationAmount':
              case 'ids':
              case 'likely':
              case 'locale':
              case 'metroArea':
              case 'organizationId':
              case 'pledgeAmount':
              case 'pledgeCurrency':
              case 'pledgeFrequency':
              case 'primaryAddress':
              case 'referrer':
              case 'referrerIds':
              case 'region':
              case 'relatedTaskAction':
              case 'source':
              case 'state':
              case 'timezone':
              case 'userIds':
                return { ...acc, [key]: value.split(',') };
              // Newsletter
              case 'newsletter':
                switch (value) {
                  case 'all':
                    return { ...acc, [key]: ContactFilterNewsletterEnum.All };
                  case 'both':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.Both,
                    };
                  case 'email':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.Email,
                    };
                  case 'email_only':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.EmailOnly,
                    };
                  case 'none':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.None,
                    };
                  case 'no_value':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.NoValue,
                    };
                  case 'physical':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.Physical,
                    };
                  case 'physical_only':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.PhysicalOnly,
                    };
                  default:
                    return { ...acc };
                }
              // Status
              case 'status':
                return {
                  ...acc,
                  [key]: value.split(',').map((enumValue) => {
                    switch (enumValue) {
                      // Status
                      case 'active':
                        return ContactFilterStatusEnum.Active;
                      case 'hidden':
                        return ContactFilterStatusEnum.Hidden;
                      case 'null':
                        return ContactFilterStatusEnum.Null;
                      case 'Appointment Scheduled':
                        return ContactFilterStatusEnum.AppointmentScheduled;
                      case 'Ask in Future':
                        return ContactFilterStatusEnum.AskInFuture;
                      case 'Call for Decision':
                        return ContactFilterStatusEnum.CallForDecision;
                      case 'Contact for Appointment':
                        return ContactFilterStatusEnum.ContactForAppointment;
                      case 'Cultivate Relationship':
                        return ContactFilterStatusEnum.CultivateRelationship;
                      case 'Expired Referral':
                        return ContactFilterStatusEnum.ExpiredReferral;
                      case 'Never Ask':
                        return ContactFilterStatusEnum.NeverAsk;
                      case 'Never Contacted':
                        return ContactFilterStatusEnum.NeverContacted;
                      case 'Not Interested':
                        return ContactFilterStatusEnum.NotInterested;
                      case 'Partner - Financial':
                        return ContactFilterStatusEnum.PartnerFinancial;
                      case 'Partner - Pray':
                        return ContactFilterStatusEnum.PartnerPray;
                      case 'Partner - Special':
                        return ContactFilterStatusEnum.PartnerSpecial;
                      case 'Research Abandoned':
                        return ContactFilterStatusEnum.ResearchAbandoned;
                      case 'Unresponsive':
                        return ContactFilterStatusEnum.Unresponsive;
                      default:
                        return ContactFilterStatusEnum.Null;
                    }
                  }),
                };

              // NumericRangeInput & String
              case 'addressLatLng':
              case 'appealStatus':
              case 'contactInfoAddr':
              case 'contactInfoEmail':
              case 'contactInfoFacebook':
              case 'contactInfoMobile':
              case 'contactInfoPhone':
              case 'contactInfoWorkPhone':
              case 'contactType':
              case 'donationAmountRange':
              case 'nameLike':
              case 'notes':
              case 'optOut':
              case 'pledge':
              case 'pledgeLateBy':
              case 'wildcardSearch':
                return { ...acc, [key]: value };
              default:
                return { ...acc };
            }
          }, {});

          return { ...acc, ...nonDefaultFilters };
        } else {
          const key = snakeToCamel(filter.name) as FilterKey;
          switch (key) {
            case 'tags':
            case 'excludeTags':
              return {
                ...acc,
                [key]: filter.value ? filter.value.split(',') : null,
              };

            case 'wildcardSearch':
              return { ...acc, [key]: filter.value };
            case 'anyTags':
              return { ...acc, [key]: (filter.value as unknown) as boolean };
            default:
              return { ...acc };
          }
        }
      }, {});

      // Set the selected filter with our saved filter data
      onSelectedFiltersChanged(newFilter);

      // close the saved filter panel
      setSavedFilterOpen(false);
    }
  };

  return (
    <Box {...boxProps}>
      <div style={{ overflow: 'hidden' }}>
        <Slide
          in={!selectedGroup && !savedFilterOpen}
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
                <IconButton onClick={onClose} aria-label={t('Close')}>
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
              <LinkButton
                color="primary"
                style={{ marginInlineStart: theme.spacing(-1) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={() => setSaveFilterModalOpen(true)}
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
                  {savedFilters.length > 0 && (
                    <Collapse key={'savedFilters'} in={true}>
                      <ListItem button onClick={() => setSavedFilterOpen(true)}>
                        <ListItemText
                          primary={t('Saved Filters')}
                          primaryTypographyProps={{ variant: 'subtitle1' }}
                        />
                        <ArrowForwardIos fontSize="small" color="disabled" />
                      </ListItem>
                    </Collapse>
                  )}
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
        <Slide in={savedFilterOpen} direction="left" mountOnEnter unmountOnExit>
          <div>
            <FilterHeader>
              <IconButton
                data-testid="CloseFilterGroupButton"
                size="small"
                edge="start"
                onClick={() => setSavedFilterOpen(false)}
                style={{ verticalAlign: 'middle' }}
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>
              <Typography
                variant="h6"
                component="span"
                style={{ verticalAlign: 'middle' }}
              >
                {t('Saved Filters')}
              </Typography>
            </FilterHeader>
            <FilterList dense>
              {savedFilters.map((filter) => {
                const filterName = (filter.key?.includes('graphql_')
                  ? filter.key.includes('graphql_saved_contacts_filter_')
                    ? filter.key?.replace('graphql_saved_contacts_filter_', '')
                    : filter.key?.replace('graphql_saved_tasks_filter_', '')
                  : filter.key?.includes('saved_contacts_filter_')
                  ? filter.key?.replace('saved_contacts_filter_', '')
                  : filter.key?.replace('saved_tasks_filter_', '')
                )?.replaceAll('_', ' ');

                return (
                  <ListItem
                    key={filter.id}
                    button
                    onClick={() => setSelectedSavedFilter(filter)}
                  >
                    <ListItemText
                      primary={filterName}
                      primaryTypographyProps={{ variant: 'subtitle1' }}
                    />
                  </ListItem>
                );
              })}
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
      <SaveFilterModal
        isOpen={saveFilterModalOpen}
        handleClose={() => setSaveFilterModalOpen(false)}
        currentFilters={selectedFilters}
      />
    </Box>
  );
};
