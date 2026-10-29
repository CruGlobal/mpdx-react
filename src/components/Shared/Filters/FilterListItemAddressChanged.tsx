import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  FormControlLabel,
  ListItem,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DateRangeInput } from 'src/graphql/types.generated';
import { ChangedDuringSelect } from './ChangedDuring/ChangedDuringSelect';
import {
  fromDateRangeInput,
  getChangedDuringOption,
  getChangedDuringRange,
  toDateRangeInput,
} from './ChangedDuring/changedDuring';

interface FilterListItemAddressChangedProps {
  title: string;
  value?: DateRangeInput | null;
  includeAutomatic: boolean;
  onUpdate: (
    value: DateRangeInput | undefined,
    includeAutomatic: boolean,
  ) => void;
}

export const FilterListItemAddressChanged: React.FC<
  FilterListItemAddressChangedProps
> = ({ title, value, includeAutomatic, onUpdate }) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <Box
        width="100%"
        p={1.5}
        borderRadius={1}
        sx={{ backgroundColor: 'chipYellowLight.main' }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="subtitle1">{title}</Typography>
          <Chip
            label={t('New')}
            size="small"
            sx={{
              backgroundColor: 'mpdxBlue.main',
              color: 'common.white',
              fontWeight: 'bold',
            }}
          />
        </Box>
        <ChangedDuringSelect
          size="small"
          fullWidth
          sx={{ backgroundColor: 'background.paper' }}
          inputProps={{ 'aria-label': title }}
          value={getChangedDuringOption(value)}
          customRange={value ? fromDateRangeInput(value) : null}
          onChange={(option) => {
            const range = getChangedDuringRange(option, null);
            onUpdate(
              range ? toDateRangeInput(range) : undefined,
              option ? includeAutomatic : true,
            );
          }}
          onCustomRangeApply={(range) =>
            onUpdate(toDateRangeInput(range), includeAutomatic)
          }
        />
        <FormControlLabel
          label={t('Include automatic updates')}
          disabled={!value}
          control={
            <Checkbox
              checked={includeAutomatic}
              onChange={(event) =>
                onUpdate(value ?? undefined, event.target.checked)
              }
            />
          }
        />
      </Box>
    </ListItem>
  );
};
