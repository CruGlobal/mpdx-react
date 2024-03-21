import React, { useState } from 'react';
import Close from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
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
import {
  ActivityTypeEnum,
  ContactFilterNewsletterEnum,
  ContactFilterNotesInput,
  ContactFilterPledgeReceivedEnum,
  ContactFilterSetInput,
  ContactFilterStatusEnum,
  FilterGroup,
  MultiselectFilter,
  ReportContactFilterSetInput,
  ResultEnum,
  TaskFilterSetInput,
} from 'src/graphql/types.generated';
import { sanitizeFilters } from 'src/lib/sanitizeFilters';
import {
  ContactsContext,
  ContactsType,
} from '../../../../pages/accountLists/[accountListId]/contacts/ContactsContext';
import { DeleteFilterModal } from './DeleteFilterModal/DeleteFilterModal';
import { FilterListItem } from './FilterListItem';
import { FilterListItemShowAll } from './FilterListItemShowAll';
import {
  FilterPanelGroupFragment,
  UserOptionFragment,
} from './FilterPanel.generated';
import { FilterKey, FilterValue } from './FilterPanelTypes';
import { SaveFilterModal } from './SaveFilterModal/SaveFilterModal';
import { FilterPanelTagsSection } from './TagsSection/FilterPanelTagsSection';
import { reverseFiltersMap } from './helpers';

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

const FlatAccordion = styled(Accordion)(({ theme }) => ({
  '&.MuiPaper-elevation1': {
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

export interface FilterPanelProps {
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
  const { handleClearAll } = React.useContext(ContactsContext) as ContactsType;

  const [saveFilterModalOpen, setSaveFilterModalOpen] = useState(false);
  const [deleteFilterModalOpen, setDeleteFilterModalOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [filterToBeDeleted, setFilterToBeDeleted] =
    useState<UserOptionFragment | null>(null);
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
              // Activity Type
              case 'activityType':
                if (value.includes('--any--')) {
                  return { ...acc, [key]: Object.values(ActivityTypeEnum) };
                }
                return {
                  ...acc,
                  [key]: value.split(',').map((enumValue) => {
                    // --any--,none
                    switch (enumValue) {
                      case 'Appointment':
                        return ActivityTypeEnum.Appointment;
                      case 'Call':
                        return ActivityTypeEnum.Call;
                      case 'Email':
                        return ActivityTypeEnum.Email;
                      case 'Facebook Message':
                        return ActivityTypeEnum.FacebookMessage;
                      case 'Prayer Request':
                        return ActivityTypeEnum.PrayerRequest;
                      case 'Talk to In Person':
                        return ActivityTypeEnum.TalkToInPerson;
                      case 'Text Message':
                        return ActivityTypeEnum.TextMessage;
                      case 'Thank':
                        return ActivityTypeEnum.Thank;
                      case 'None':
                        return ActivityTypeEnum.None;
                      case 'Letter':
                        return ActivityTypeEnum.Letter;
                      case 'Newsletter - Physical':
                        return ActivityTypeEnum.NewsletterPhysical;
                      case 'Newsletter - Email':
                        return ActivityTypeEnum.NewsletterEmail;
                      case 'Pre Call Letter':
                        return ActivityTypeEnum.PreCallLetter;
                      case 'Reminder Letter':
                        return ActivityTypeEnum.ReminderLetter;
                      case 'Support Letter':
                        return ActivityTypeEnum.SupportLetter;
                      case 'To Do':
                        return ActivityTypeEnum.ToDo;
                      default:
                        return ActivityTypeEnum.None;
                    }
                  }),
                };

              // Next Action
              case 'nextAction':
                if (value.includes('--any--')) {
                  return {
                    ...acc,
                    [key]: [
                      ActivityTypeEnum.Appointment,
                      ActivityTypeEnum.Call,
                      ActivityTypeEnum.Email,
                      ActivityTypeEnum.FacebookMessage,
                      ActivityTypeEnum.PrayerRequest,
                      ActivityTypeEnum.TalkToInPerson,
                      ActivityTypeEnum.TextMessage,
                      ActivityTypeEnum.Thank,
                      ActivityTypeEnum.None,
                    ],
                  };
                }
                return {
                  ...acc,
                  [key]: value.split(',').map((enumValue) => {
                    switch (enumValue) {
                      case 'Appointment':
                        return ActivityTypeEnum.Appointment;
                      case 'Call':
                        return ActivityTypeEnum.Call;
                      case 'Email':
                        return ActivityTypeEnum.Email;
                      case 'Facebook Message':
                        return ActivityTypeEnum.FacebookMessage;
                      case 'Prayer Request':
                        return ActivityTypeEnum.PrayerRequest;
                      case 'Talk to In Person':
                        return ActivityTypeEnum.TalkToInPerson;
                      case 'Text Message':
                        return ActivityTypeEnum.TextMessage;
                      case 'Thank':
                        return ActivityTypeEnum.Thank;
                      case 'None':
                        return ActivityTypeEnum.None;
                      default:
                        return ActivityTypeEnum.None;
                    }
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
      onSelectedFiltersChanged(newFilter);
    }
  };

  const handleDeleteSavedFilter = async (filter: UserOptionFragment) => {
    setFilterToBeDeleted(filter);
    setDeleteFilterModalOpen(true);
  };

  const handleClearAllClick = () => {
    handleClearAll();
    clearSelectedFilter();
  };

  const tagsFilters =
    (
      filters.find((filter) => filter?.filters[0]?.filterKey === 'tags')
        ?.filters[0] as MultiselectFilter
    )?.options ?? [];
  const noSelectedFilters =
    Object.keys(sanitizeFilters(selectedFilters)).length === 0;

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
                <IconButton
                  onClick={onClose}
                  aria-label={t('Close')}
                  data-testid="FilterPanelClose"
                >
                  <Close titleAccess={t('Close')} />
                </IconButton>
              </Box>
              <LinkButton
                style={{ marginInlineStart: theme.spacing(-1) }}
                disabled={noSelectedFilters}
                onClick={() => setSaveFilterModalOpen(true)}
              >
                {t('Save')}
              </LinkButton>
              <LinkButton
                style={{ marginInlineStart: theme.spacing(2) }}
                disabled={noSelectedFilters}
                onClick={handleClearAllClick}
              >
                {t('Clear All')}
              </LinkButton>
            </FilterHeader>
            {tagsFilters.some((filter) => filter.value !== '--any--') && (
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
                    <FlatAccordion>
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
                                secondaryAction={
                                  <IconButton
                                    edge="end"
                                    aria-label={t('Delete')}
                                    data-testid="deleteSavedFilter"
                                    onClick={() =>
                                      handleDeleteSavedFilter(filter)
                                    }
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                }
                              >
                                <ListItemText
                                  onClick={() => setSelectedSavedFilter(filter)}
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
                    </FlatAccordion>
                  )}

                  {filters
                    ?.filter(
                      (filter) => filter?.filters[0]?.filterKey !== 'tags',
                    )
                    ?.map((group) => {
                      const selectedOptions = getOptionsSelected(group);
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
                                {group.name}
                                {selectedOptions.length > 0
                                  ? ` (${selectedOptions.length})`
                                  : ''}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <FilterList dense>
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
                              </FilterList>
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
