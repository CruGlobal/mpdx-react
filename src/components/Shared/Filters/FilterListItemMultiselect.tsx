import React from 'react';
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
import { MultiselectFilter } from 'src/graphql/types.generated';
import { reverseFiltersMap } from './helpers';

interface Props {
  filter: MultiselectFilter;
  selected?: Array<string>;
  onUpdate: (value?: Array<string>) => void;
  onReverseFilter?: () => void;
  reverseSelected?: boolean;
}

export const FilterListItemMultiselect: React.FC<Props> = ({
  filter,
  selected,
  onUpdate,
  onReverseFilter,
  reverseSelected,
}: Props) => {
  const { t } = useTranslation();
  const toggleValue = (value?: string[]) => {
    onUpdate(value);
  };

  const isChecked = (value?: string | null) =>
    selected && selected.some((it) => it === value);

  const toggleCheckValue = (value?: string | null) => {
    if (value && !isChecked(value)) {
      onUpdate(selected ? [...selected, value] : [value]);
    } else {
      onUpdate(selected?.filter((it) => it !== value));
    }
  };

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
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      {filter.filterKey !== 'pledge_amount' ? (
        <ListItem>
          <Autocomplete
            multiple
            autoSelect
            autoHighlight
            value={selected || []}
            onChange={(_, value) => toggleValue(value)}
            options={filter.options?.map(({ value }) => value) || []}
            getOptionLabel={(option) =>
              filter.options?.find(
                ({ value }) => String(value) === String(option),
              )?.name ?? ''
            }
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
                placeholder={filter.title}
                label={filter.title}
                data-testid="multiSelectFilter"
              />
            )}
          />
        </ListItem>
      ) : (
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
      )}
    </div>
  );
};
