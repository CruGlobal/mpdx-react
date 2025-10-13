import React, { useMemo, useState } from 'react';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  BoxProps,
  Button,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { filter } from 'lodash';
import { useTranslation } from 'react-i18next';
import { removeTagsFromFilters } from 'pages/accountLists/[accountListId]/tasks/sanitizeFilters';
import { useApiConstants } from 'src/components/Constants/UseApiConstants';
import { useUrlFilters } from 'src/components/common/UrlFiltersProvider/UrlFiltersProvider';
import {
  ActivityTypeEnum,
  ContactFilterNewsletterEnum,
  ContactFilterNotesInput,
  ContactFilterPledgeReceivedEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  FilterGroup,
  ReportContactFilterSetInput,
  ResultEnum,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { convertStatus } from 'src/utils/functions/convertContactStatus';
import { DeleteFilterModal } from './DeleteFilterModal/DeleteFilterModal';
import { FilterList } from './FilterList';
import { FilterListItem } from './FilterListItem';
import { FilterListItemShowAll } from './FilterListItemShowAll';
import {
  FilterPanelGroupFragment,
  UserOptionFragment,
} from './FilterPanel.generated';
import { FilterKey, FilterValue } from './FilterPanelTypes';
import { SaveFilterModal } from './SaveFilterModal/SaveFilterModal';
import { FilterPanelTagsSection } from './TagsSection/FilterPanelTagsSection';
import { renameFilterNames, reverseFiltersMap } from './helpers';

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

const StyledFilterList = styled(List)(({ theme }) => ({
  '& .MuiListItemIcon-root': {
    minWidth: '37px',
  },
  '& .FilterListItemMultiselect-root': {
    marginBottom: theme.spacing(4),
  },
}));

const LinkButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  textTransform: 'none',
  fontSize: 16,
  color: theme.palette.info.main,
  fontWeight: 'bold',
}));

const FlatAccordion = styled(Accordion)(({ theme }) => ({
  '&.MuiPaper-elevation1': {
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
    marginBottom: 0,
    '&:before': { display: 'none' },
  },
  '& .MuiAccordionDetails-root': {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

export type FilterInput = ContactFilterSetInput &
  TaskFilterSetInput &
  ReportContactFilterSetInput;

export interface FilterPanelProps {
  filters: FilterPanelGroupFragment[];
  defaultExpandedFilterGroups?: Set<string>;
  savedFilters: UserOptionFragment[];
  preDefinedFilters?: UserOptionFragment[];
  onClose: () => void;
  showSaveButton?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  filters,
  defaultExpandedFilterGroups = new Set(),
  savedFilters,
  preDefinedFilters,
  onClose,
  showSaveButton = true,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const activities = useApiConstants()?.activities;
  const [saveFilterModalOpen, setSaveFilterModalOpen] = useState(false);
  const [deleteFilterModalOpen, setDeleteFilterModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filterToBeDeleted, setFilterToBeDeleted] =
    useState<UserOptionFragment | null>(null);

  const matchFilterContactStatuses = (status: string | null | undefined) => {
    return (
      Object.values(ContactFilterStatusEnum).find(
        (value) => value === status?.toUpperCase(),
      ) || null
    );
  };

  const {
    activeFilters: selectedFilters,
    setActiveFilters,
    clearFilters,
  } = useUrlFilters();

  const updateSelectedFilter = (name: FilterKey, value?: FilterValue) => {
    if (value && (!Array.isArray(value) || value.length > 0)) {
      let filterValue = value;
      if (name === 'notes') {
        filterValue = { wildcardNoteSearch: value } as ContactFilterNotesInput;
      }
      const newFilters: FilterInput = {
        ...selectedFilters,
        [name]: filterValue,
      };
      setActiveFilters(newFilters);
    } else {
      const newFilters: FilterInput = {
        ...selectedFilters,
      };
      delete newFilters[name];

      setActiveFilters(newFilters);
    }
  };
  const clearSelectedFilter = () => {
    setActiveFilters({});
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

  const isGroupVisible = (group: FilterGroup) =>
    (getSelectedFilters(group).length > 0 || group.featured) ?? undefined;

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

      if (
        filter.key?.includes('graphql_') ||
        filter.id?.includes('prewritten-filter-')
      ) {
        // Clear current filters
        clearSelectedFilter();
        // Filter out accountListId from filter
        const newFilter = Object.keys(parsedFilter)
          .filter((key) => key !== 'accountListId')
          .reduce((res, key) => {
            return { ...res, [key]: parsedFilter[key] };
          }, {});
        // Set the selected filter with our saved filter data
        setActiveFilters(newFilter);
        return;
      }
      // Map through keys to convert key to camel from snake
      const filters = Object.keys(parsedFilter).map(
        (key) =>
          ({
            name: snakeToCamel(key),
            value: parsedFilter[key],
          }) as { name: string; value: FilterKey },
      );

      const newFilter = filters.reduce<FilterInput>((acc, filter) => {
        if (filter.name === 'params') {
          const nonDefaultFilters = Object.entries(
            filter.value,
          ).reduce<FilterInput>((acc, [name, value]) => {
            const key = snakeToCamel(name) as FilterKey;
            switch (key) {
              // Boolean
              case 'addressHistoric':
              case 'addressValid':
              case 'anyTags':
              case 'completed':
              case 'noAppeals':
              case 'overdue':
              case 'reverseAlmaMater':
              case 'reverseAppeal':
              case 'reverseActivityType':
              case 'reverseContactAppeal':
              case 'reverseContactChurch':
              case 'reverseContactCity':
              case 'reverseContactCountry':
              case 'reverseContactDesignationAccountId':
              case 'reverseContactIds':
              case 'reverseContactLikely':
              case 'reverseContactMetroArea':
              case 'reverseContactPledgeFrequency':
              case 'reverseContactReferrer':
              case 'reverseContactRegion':
              case 'reverseContactState':
              case 'reverseContactStatus':
              case 'reverseContactTimezone':
              case 'reverseContactType':
              case 'reverseNextAction':
              case 'reverseResult':
              case 'reverseTags':
              case 'reverseUserIds':
              case 'reverseChurch':
              case 'reverseCity':
              case 'reverseCountry':
              case 'reverseDesignationAccountId':
              case 'reverseDonation':
              case 'reverseDonationAmount':
              case 'reverseDonationPeriodAverage':
              case 'reverseDonationPeriodCount':
              case 'reverseDonationPeriodPercentRank':
              case 'reverseDonationPeriodSum':
              case 'reverseIds':
              case 'reverseLikely':
              case 'reverseLocale':
              case 'reverseMetroArea':
              case 'reversePledgeAmount':
              case 'reversePledgeCurrency':
              case 'reversePledgeFrequency':
              case 'reverseReferrer':
              case 'reverseRegion':
              case 'reverseRelatedTaskAction':
              case 'reverseSource':
              case 'reverseState':
              case 'reverseStatus':
              case 'reverseTimezone':
              case 'starred':
              case 'statusValid':
              case 'tasksAllCompleted':
              case 'reverseContactType':
              case 'reverseTags':
                return { ...acc, [key]: value.toString() === 'true' };
              // DateRangeInput
              case 'donationDate':
              case 'createdAt':
              case 'completedAt':
              case 'anniversary':
              case 'birthday':
              case 'dateRange':
              case 'gaveMoreThanPledgedRange':
              case 'lateAt':
              case 'nextAsk':
              case 'pledgeAmountIncreasedRange':
              case 'startAt':
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
              case 'contactChurch':
              case 'city':
              case 'contactCity':
              case 'country':
              case 'contactCountry':
              case 'designationAccountId':
              case 'contactDesignationAccountId':
              case 'donation':
              case 'donationAmount':
              case 'ids':
              case 'likely':
              case 'contactLikely':
              case 'locale':
              case 'metroArea':
              case 'contactMetroArea':
              case 'organizationId':
              case 'pledgeAmount':
              case 'pledgeCurrency':
              case 'pledgeFrequency':
              case 'contactPledgeFrequency':
              case 'referrer':
              case 'contactReferrer':
              case 'referrerIds':
              case 'region':
              case 'contactRegion':
              case 'relatedTaskAction':
              case 'source':
              case 'state':
              case 'contactState':
              case 'timezone':
              case 'contactTimezone':
              case 'userIds':
                return {
                  ...acc,
                  [key]: typeof value === 'string' ? value.split(',') : value,
                };
              // Newsletter
              case 'newsletter':
              case 'contactNewsletter':
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
                  case 'address':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.Physical,
                    };
                  case 'physical_only':
                  case 'address_only':
                    return {
                      ...acc,
                      [key]: ContactFilterNewsletterEnum.PhysicalOnly,
                    };
                  default:
                    return { ...acc };
                }
              // Pledge Received
              case 'pledgeReceived':
                switch (value) {
                  case 'true':
                    return {
                      ...acc,
                      [key]: ContactFilterPledgeReceivedEnum.Received,
                    };
                  case 'false':
                    return {
                      ...acc,
                      [key]: ContactFilterPledgeReceivedEnum.NotReceived,
                    };
                  default:
                    return {
                      ...acc,
                      [key]: ContactFilterPledgeReceivedEnum.Any,
                    };
                }
              // Status
              case 'status':
              case 'contactStatus':
                if (value.includes('--any--')) {
                  return {
                    ...acc,
                    [key]: Object.values(ContactFilterStatusEnum),
                  };
                }
                return {
                  ...acc,
                  [key]: value.split(',').map((enumValue) => {
                    // Saved Filters contact status could be in 'Partner - Financial' format from Angular or lowercase 'partner_financial' or uppercase ENUM
                    return (
                      convertStatus(enumValue) ||
                      matchFilterContactStatuses(enumValue) ||
                      ContactFilterStatusEnum.Null
                    );
                  }),
                };
              // Activity Type
              case 'activityType':
              case 'relatedTaskAction':
              // Next Action
              case 'nextAction':
                if (value.includes('--any--')) {
                  return {
                    ...acc,
                    [key]: Object.values(ActivityTypeEnum),
                  };
                }
                return {
                  ...acc,
                  [key]: value.split(',').map((enumValue) => {
                    // --any--,none
                    return (
                      (activities?.find((activity) => {
                        return (
                          activity.id === enumValue ||
                          activity.value === enumValue ||
                          activity?.id?.toLowerCase() === enumValue
                        );
                      })?.id as ActivityTypeEnum) || ActivityTypeEnum.None
                    );
                  }),
                };
              // Result
              case 'result':
                if (value.includes('--any--')) {
                  return { ...acc, [key]: Object.values(ResultEnum) };
                }
                return {
                  ...acc,
                  [key]: value.split(',').map((enumValue) => {
                    switch (enumValue) {
                      case 'Attempted':
                        return ResultEnum.Attempted;
                      case 'Attempted - Left Message':
                        return ResultEnum.AttemptedLeftMessage;
                      case 'Completed':
                        return ResultEnum.Completed;
                      case 'Done':
                        return ResultEnum.Done;
                      case 'None':
                        return ResultEnum.None;
                      case 'Received':
                        return ResultEnum.Received;
                      default:
                        return ResultEnum.None;
                    }
                  }),
                };

              // NumericRangeInput & String
              case 'addressLatLng':
              case 'appealStatus':
              case 'contactAppeal':
              case 'contactInfoAddr':
              case 'contactInfoEmail':
              case 'contactInfoFacebook':
              case 'contactInfoMobile':
              case 'contactInfoPhone':
              case 'contactInfoWorkPhone':
              case 'contactType':
              case 'donationAmountRange':
              case 'donationPeriodAverage':
              case 'donationPeriodCount':
              case 'donationPeriodPercentRank':
              case 'donationPeriodSum':
              case 'nameLike':
              case 'notes':
              case 'optOut':
              case 'pledge':
              case 'pledgeLateBy':
              case 'primaryAddress':
              case 'wildcardSearch':
                if (key === 'notes' && (value as any)?.wildcard_note_search) {
                  (value as ContactFilterNotesInput).wildcardNoteSearch = (
                    value as any
                  ).wildcard_note_search;
                  delete (value as any).wildcard_note_search;
                }
                if (key === 'donationAmountRange') {
                  value['min'] = Number(value['min']);
                  value['max'] = Number(value['max']);
                }
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
              return { ...acc, [key]: filter.value as unknown as boolean };
            default:
              return { ...acc };
          }
        }
      }, {});

      // Set the selected filter with our saved filter data
      setActiveFilters(newFilter);
    }
  };

  const handleDeleteSavedFilter = async (filter: UserOptionFragment) => {
    setFilterToBeDeleted(filter);
    setDeleteFilterModalOpen(true);
  };

  const tagsFilters = useMemo(() => {
    const tags = filters.find(
      (filter) => filter?.filters[0]?.filterKey === 'tags',
    )?.filters[0];
    if (tags?.__typename === 'MultiselectFilter' && tags.options) {
      return [...tags.options].sort((tag1, tag2) =>
        tag1.name.localeCompare(tag2.name),
      );
    }
    return [];
  }, [filter]);
  const noSelectedFilters =
    Object.keys(removeTagsFromFilters(selectedFilters)).length === 0;

  return (
    <Box {...boxProps}>
      <div style={{ overflow: 'hidden' }}>
        <Slide in direction="right" appear={false} mountOnEnter unmountOnExit>
          <div>
            <FilterHeader>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h6"
                  id="left-panel-header"
                  data-testid="FilterPanelActiveFilters"
                >
                  {selectedFilterCount > 0
                    ? t('Filter ({{count}} active)', {
                        count: selectedFilterCount,
                      })
                    : t('Filter')}
                </Typography>
                <IconButton
                  onClick={onClose}
                  aria-label={t('Close')}
                  data-testid="FilterPanelClose"
                >
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
              {showSaveButton && (
                <LinkButton
                  style={{ marginInlineStart: theme.spacing(-1) }}
                  disabled={noSelectedFilters}
                  onClick={() => setSaveFilterModalOpen(true)}
                >
                  {t('Save')}
                </LinkButton>
              )}
              <LinkButton
                style={{
                  marginInlineStart: theme.spacing(showSaveButton ? 2 : -1),
                }}
                disabled={noSelectedFilters}
                onClick={clearFilters}
              >
                {t('Clear All')}
              </LinkButton>
            </FilterHeader>
            {tagsFilters.some((filter) => filter.value !== '--any--') && (
              <FilterPanelTagsSection
                filterOptions={tagsFilters}
                selectedFilters={selectedFilters}
                onSelectedFiltersChanged={setActiveFilters}
              />
            )}
            <StyledFilterList dense sx={{ paddingY: 0 }}>
              {filters?.length === 0 ? (
                <ListItem data-testid="NoFiltersState">
                  <ListItemText
                    primary={t('No Filters Found')}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                </ListItem>
              ) : (
                <>
                  {preDefinedFilters && preDefinedFilters.length > 0 && (
                    <FlatAccordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{t('Predefined Filters')}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <StyledFilterList dense sx={{ paddingY: 0 }}>
                          <FilterList
                            filters={preDefinedFilters}
                            onFilterSelect={setSelectedSavedFilter}
                            onFilterDelete={handleDeleteSavedFilter}
                          />
                        </StyledFilterList>
                      </AccordionDetails>
                    </FlatAccordion>
                  )}

                  {savedFilters.length > 0 && (
                    <FlatAccordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography>{t('Saved Filters')}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <StyledFilterList dense sx={{ paddingY: 0 }}>
                          <FilterList
                            filters={savedFilters}
                            onFilterSelect={setSelectedSavedFilter}
                            onFilterDelete={handleDeleteSavedFilter}
                          />
                        </StyledFilterList>
                      </AccordionDetails>
                    </FlatAccordion>
                  )}

                  {filters
                    ?.filter(
                      (filter) => filter?.filters[0]?.filterKey !== 'tags',
                    )
                    ?.map((group) => {
                      const selectedOptions = getOptionsSelected(group);
                      const groupName = renameFilterNames(group.name);
                      return (
                        <Collapse
                          key={group.name}
                          in={showAll || isGroupVisible(group)}
                          data-testid="FilterGroup"
                        >
                          <FlatAccordion
                            TransitionProps={{ unmountOnExit: true }}
                            defaultExpanded={defaultExpandedFilterGroups.has(
                              group.name,
                            )}
                          >
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography>
                                {groupName}
                                {selectedOptions.length > 0
                                  ? ` (${selectedOptions.length})`
                                  : ''}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <StyledFilterList dense>
                                {group.filters.map((filter) => {
                                  const { filterKey } = filter;
                                  const filterKeyCamel = snakeToCamel(
                                    filterKey,
                                  ) as FilterKey;

                                  const reverseFiltersKey =
                                    reverseFiltersMap.get(
                                      filterKey,
                                    ) as FilterKey;

                                  const filterValue =
                                    selectedFilters[filterKeyCamel] || '';

                                  const FilterListItemValue = (
                                    filterValue as ContactFilterNotesInput
                                  ).wildcardNoteSearch
                                    ? (filterValue as ContactFilterNotesInput)
                                        .wildcardNoteSearch
                                    : filterValue;

                                  return (
                                    <FilterListItem
                                      key={filterKeyCamel}
                                      filter={filter}
                                      value={FilterListItemValue}
                                      onUpdate={(value) =>
                                        updateSelectedFilter(
                                          filterKeyCamel,
                                          value,
                                        )
                                      }
                                      reverseSelected={
                                        !!selectedFilters[reverseFiltersKey]
                                      }
                                      onReverseFilter={() =>
                                        updateSelectedFilter(
                                          reverseFiltersKey,
                                          !selectedFilters[reverseFiltersKey],
                                        )
                                      }
                                    />
                                  );
                                })}
                              </StyledFilterList>
                            </AccordionDetails>
                          </FlatAccordion>
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
            </StyledFilterList>
          </div>
        </Slide>
      </div>
      <SaveFilterModal
        isOpen={saveFilterModalOpen}
        handleClose={() => setSaveFilterModalOpen(false)}
        currentFilters={selectedFilters}
        currentSavedFilters={savedFilters}
      />
      {filterToBeDeleted && (
        <DeleteFilterModal
          isOpen={deleteFilterModalOpen}
          handleClose={() => setDeleteFilterModalOpen(false)}
          filter={filterToBeDeleted}
        />
      )}
    </Box>
  );
};
