import React, { useMemo } from 'react';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import {
  Checkbox,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MultiselectFilter } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { getLocalizedPhase } from 'src/utils/functions/getLocalizedPhase';
import { MultiselectFilterAutocomplete } from './MultiselectFilterAutocomplete';
import { renameFilterNames, reverseFiltersMap } from './helpers';

interface FilterListItemMultiselectProps {
  filter: MultiselectFilter;
  selected?: Array<string>;
  onUpdate: (value?: Array<string>) => void;
  onReverseFilter?: () => void;
  reverseSelected?: boolean;
}

export const FilterListItemMultiselect: React.FC<
  FilterListItemMultiselectProps
> = ({
  filter,
  selected,
  onUpdate,
  onReverseFilter,
  reverseSelected,
}: FilterListItemMultiselectProps) => {
  const { t } = useTranslation();
  const toggleValue = (value?: string[]) => {
    onUpdate(value);
  };
  const { statusArray } = useContactPartnershipStatuses();

  const isChecked = (value?: string | null) =>
    selected && selected.some((it) => it === value);

  const toggleCheckValue = (value?: string | null) => {
    if (value && !isChecked(value)) {
      onUpdate(selected ? [...selected, value] : [value]);
    } else {
      onUpdate(selected?.filter((it) => it !== value));
    }
  };

  const filterTitle = renameFilterNames(filter.title);

  // If it is a status filter, group the status options by phase
  const isStatusFilter = useMemo(
    () =>
      filter.filterKey === 'status' || filter.filterKey === 'contact_status',
    [filter.filterKey],
  );

  const getStatusPhaseId = (selectedStatus: string) =>
    statusArray.find((status) => status.id === selectedStatus)?.phase;

  const groupByPhase = (option: string) =>
    getLocalizedPhase(t, getStatusPhaseId(option));

  const filterOptions = useMemo(() => {
    return isStatusFilter
      ? filter.options
          ?.slice()
          .sort(
            (a, b) =>
              getStatusPhaseId(a.value)?.localeCompare(
                getStatusPhaseId(b.value) || '',
              ) || -1,
          )
          ?.map(({ value }) => value) || []
      : filter.options?.map(({ value }) => value) || [];
  }, [filter.options, statusArray, isStatusFilter]);

  return (
    <div className="FilterListItemMultiselect-root">
      <ListItem
        secondaryAction={
          reverseFiltersMap.get(filter.filterKey) &&
          onReverseFilter && (
            <Tooltip title={t('Reverse Filter')}>
              <IconButton
                edge="end"
                aria-label={t('Reverse Filter')}
                color={reverseSelected ? 'error' : 'default'}
                disabled={!selected}
                onClick={onReverseFilter}
              >
                <SyncAltIcon />
              </IconButton>
            </Tooltip>
          )
        }
      >
        <ListItemText
          primary={filterTitle}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      {filter.filterKey === 'pledge_amount' ? (
        filter.options?.map(({ value, name }) => (
          <ListItem key={value} button onClick={() => toggleCheckValue(value)}>
            <ListItemIcon data-testid="MultiSelectOption">
              <Checkbox
                data-testid="CheckboxIcon"
                edge="start"
                color="secondary"
                checked={isChecked(value)}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={name}
              primaryTypographyProps={{ variant: 'subtitle1' }}
            />
          </ListItem>
        ))
      ) : (
        <ListItem>
          <MultiselectFilterAutocomplete
            filter={filter}
            selected={selected}
            toggleValue={toggleValue}
            filterTitle={filterTitle}
            reverseSelected={reverseSelected}
            groupBy={isStatusFilter ? groupByPhase : undefined}
            options={filterOptions}
          />
        </ListItem>
      )}
    </div>
  );
};
