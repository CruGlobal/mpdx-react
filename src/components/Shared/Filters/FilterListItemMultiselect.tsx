import React, { useMemo } from 'react';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import {
  Autocomplete,
  Checkbox,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { MultiselectFilter, PhaseEnum } from 'src/graphql/types.generated';
import { useContactPartnershipStatuses } from 'src/hooks/useContactPartnershipStatuses';
import { getLocalizedPhase } from 'src/utils/functions/getLocalizedPhase';
import { renameFilterNames, reverseFiltersMap } from './helpers';

interface MultiselectAutocompleteProps {
  filter: MultiselectFilter;
  selected?: Array<string>;
  toggleValue: (value?: Array<string>) => void;
  filterTitle: string | undefined;
  reverseSelected?: boolean;
  groupBy?: ((option: any) => string) | undefined;
  options: string[];
}
const MultiselectFilterAutocomplete: React.FC<MultiselectAutocompleteProps> = ({
  filter,
  selected,
  toggleValue,
  filterTitle,
  reverseSelected,
  groupBy,
  options,
}: MultiselectAutocompleteProps) => {
  return (
    <Autocomplete
      multiple
      autoHighlight
      autoSelect
      value={selected || []}
      onChange={(_, value) => toggleValue(value)}
      options={options}
      getOptionLabel={(option) =>
        filter.options?.find(({ value }) => String(value) === String(option))
          ?.name ?? ''
      }
      groupBy={groupBy}
      ChipProps={{
        color: reverseSelected ? 'error' : 'default',
        style: {
          background: reverseSelected ? '#d32f2f' : '#ffffff',
        },
      }}
      filterSelectedOptions
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={filterTitle}
          label={filterTitle}
          data-testid="multiSelectFilter"
        />
      )}
    />
  );
};

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

  const groupByPhase = (option) =>
    getLocalizedPhase(
      t,
      statusArray.find((status) => status.id === option)?.phase,
    );

  const filterOptions = useMemo(() => {
    const findStatusPhase = (
      selectedStatus: string,
    ): PhaseEnum | null | undefined =>
      statusArray?.find((status) => status.id === selectedStatus)?.phase;

    return isStatusFilter
      ? filter.options
          ?.slice()
          .sort(
            (a, b) =>
              findStatusPhase(a.value)?.localeCompare(
                findStatusPhase(b.value) || '',
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
