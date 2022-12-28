import React, { useState } from 'react';
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
import { useTheme, styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Close from '@mui/icons-material/Close';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { filter } from 'lodash';
import {
  ContactFilterNewsletterEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  FilterGroup,
  MultiselectFilter,
  ReportContactFilterSetInput,
  TaskFilterSetInput,
} from '../../../../graphql/types.generated';
import {
  FilterPanelGroupFragment,
  UserOptionFragment,
} from './FilterPanel.generated';
import { FilterListItemShowAll } from './FilterListItemShowAll';
import { FilterListItem } from './FilterListItem';
import { SaveFilterModal } from './SaveFilterModal/SaveFilterModal';
import { FilterPanelTagsSection } from './TagsSection/FilterPanelTagsSection';

type ContactFilterKey = keyof ContactFilterSetInput;
type ContactFilterValue = ContactFilterSetInput[ContactFilterKey];
type ReportContactFilterKey = keyof ReportContactFilterSetInput;
type ReportContactFilterValue = ReportContactFilterSetInput[ContactFilterKey];
type TaskFilterKey = keyof TaskFilterSetInput;
type TaskFilterValue = TaskFilterSetInput[TaskFilterKey];
export type FilterKey =
  | ContactFilterKey
  | TaskFilterKey
  | ReportContactFilterKey;
export type FilterValue =
  | ContactFilterValue
  | TaskFilterValue
  | ReportContactFilterValue;

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

const LinkButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  textTransform: 'none',
  fontSize: 16,
  color: theme.palette.info.main,
  fontWeight: 'bold',
}));

const FlatAccordionWrapper = styled(Box)(({ theme }) => ({
  '& .MuiPaper-elevation1': {
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.cruGrayLight.main}`,
  },
  '& .MuiAccordionDetails-root': {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

type FilterInput = ContactFilterSetInput &
  TaskFilterSetInput &
  ReportContactFilterSetInput;

interface FilterPanelProps {
  filters: FilterPanelGroupFragment[];
  defaultExpandedFilterGroups?: Set<string>;
  savedFilters: UserOptionFragment[];
  selectedFilters: FilterInput;
  onClose: () => void;
  onSelectedFiltersChanged: (selectedFilters: FilterInput) => void;
}

export const FilterPanel: React.FC<FilterPanelProps & BoxProps> = ({
  filters,
  defaultExpandedFilterGroups = new Set(),
  savedFilters,
  onClose,
  selectedFilters,
  onSelectedFiltersChanged,
  ...boxProps
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [saveFilterModalOpen, setSaveFilterModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const updateSelectedFilter = (name: FilterKey, value?: FilterValue) => {
    if (value && (!Array.isArray(value) || value.length > 0)) {
      const newFilters: FilterInput = {
        ...selectedFilters,
        [name]: value,
      };
      onSelectedFiltersChanged(newFilters);
    } else {
      const newFilters: FilterInput = {
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
              case 'donationPeriodAverage':
              case 'donationPeriodCount':
              case 'donationPeriodPercentRank':
              case 'donationPeriodSum':
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
              return { ...acc, [key]: filter.value as unknown as boolean };
            default:
              return { ...acc };
          }
        }
      }, {});

      // Set the selected filter with our saved filter data
      onSelectedFiltersChanged(newFilter);
    }
  };

  const tagsFilters =
    (
      filters?.find((filter) => filter.name === 'Tags')
        ?.filters[0] as MultiselectFilter
    )?.options ?? [];

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
                style={{ marginInlineStart: theme.spacing(-1) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={() => setSaveFilterModalOpen(true)}
              >
                {t('Save')}
              </LinkButton>
              <LinkButton
                style={{ marginInlineStart: theme.spacing(2) }}
                disabled={Object.keys(selectedFilters).length === 0}
                onClick={clearSelectedFilter}
              >
                {t('Clear All')}
              </LinkButton>
            </FilterHeader>
            {tagsFilters && (
              <FilterPanelTagsSection
                filterOptions={tagsFilters}
                selectedFilters={selectedFilters}
                onSelectedFiltersChanged={onSelectedFiltersChanged}
              />
            )}
            <FilterList dense sx={{ paddingY: 0 }}>
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
                    <FlatAccordionWrapper>
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>{t('Saved Filters')}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <FilterList dense sx={{ paddingY: 0 }}>
                            {savedFilters.map((filter) => {
                              const filterName = filter?.key
                                ?.replace(
                                  /^(graphql_)?saved_(contacts|tasks|)_filter_/,
                                  '',
                                )
                                .replaceAll('_', ' ');

                              return (
                                <ListItem
                                  key={filter.id}
                                  button
                                  onClick={() => setSelectedSavedFilter(filter)}
                                >
                                  <ListItemText
                                    primary={filterName}
                                    primaryTypographyProps={{
                                      variant: 'subtitle1',
                                    }}
                                  />
                                </ListItem>
                              );
                            })}
                          </FilterList>
                        </AccordionDetails>
                      </Accordion>
                    </FlatAccordionWrapper>
                  )}

                  {filters
                    ?.filter((filter) => filter.name !== 'Tags')
                    ?.map((group) => {
                      const selectedOptions = getOptionsSelected(group);
                      return (
                        <Collapse
                          key={group.name}
                          in={showAll || isGroupVisible(group)}
                          data-testid="FilterGroup"
                        >
                          <FlatAccordionWrapper>
                            <Accordion
                              TransitionProps={{ unmountOnExit: true }}
                              defaultExpanded={defaultExpandedFilterGroups.has(
                                group.name,
                              )}
                            >
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography>
                                  {group.name}
                                  {selectedOptions.length > 0
                                    ? ` (${selectedOptions.length})`
                                    : ''}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <FilterList dense>
                                  {group.filters.map((filter) => {
                                    const filterKey = snakeToCamel(
                                      filter.filterKey,
                                    ) as FilterKey;

                                    return (
                                      <FilterListItem
                                        key={filterKey}
                                        filter={filter}
                                        value={selectedFilters[filterKey]}
                                        onUpdate={(value) =>
                                          updateSelectedFilter(filterKey, value)
                                        }
                                      />
                                    );
                                  })}
                                </FilterList>
                              </AccordionDetails>
                            </Accordion>
                          </FlatAccordionWrapper>
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
      </div>
      <SaveFilterModal
        isOpen={saveFilterModalOpen}
        handleClose={() => setSaveFilterModalOpen(false)}
        currentFilters={selectedFilters}
        currentSavedFilters={savedFilters}
      />
    </Box>
  );
};
