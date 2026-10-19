import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { ContactFilterPartnerEnum } from 'src/graphql/types.generated';
import { manualSourceValue, sourceToStr } from 'src/lib/sourceHelper';
import {
  ContactFilterChangedDuringEnum,
  DateRange,
  MadeByOption,
  formatChangedDuringFilter,
  formatPartnerFilter,
  groupMadeByOptions,
} from '../helpers';
import { CustomDateRangeModal } from './CustomDateRangeModal/CustomDateRangeModal';

interface AddressFiltersProps {
  dateRange: DateRange | null;
  onDateRangeChange: (dateRange: DateRange) => void;
  madeBy: string | null;
  madeByOptions: MadeByOption[];
  onMadeByChange: (madeBy: string | null) => void;
}

export const AddressFilters: React.FC<AddressFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  madeBy,
  madeByOptions,
  onMadeByChange,
}) => {
  const { t } = useTranslation();
  const { data: userData } = useGetUserQuery();
  const currentUserId = userData?.user.id;

  const { automatic: automaticOptions, mpdx: mpdxOptions } = groupMadeByOptions(
    madeByOptions,
    currentUserId,
    t,
  );
  const [customDateRangeOpen, setCustomDateRangeOpen] = React.useState(false);

  const handleClose = () => setCustomDateRangeOpen(false);
  const handleApply = (range: DateRange) => {
    onDateRangeChange(range);
    setCustomDateRangeOpen(false);
  };

  return (
    <Box display="flex" gap={2} flex={1} minWidth={0}>
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel id="partner-filter-label">{t('Partner')}</InputLabel>
        <Select labelId="partner-filter-label" label={t('Partner')}>
          {Object.values(ContactFilterPartnerEnum).map((partner) => (
            <MenuItem key={partner} value={partner}>
              {formatPartnerFilter(partner, t)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel id="changed-during-filter-label">
          {t('Changed during')}
        </InputLabel>
        <Select
          labelId="changed-during-filter-label"
          label={t('Changed during')}
          onChange={(event) => {
            if (event.target.value === ContactFilterChangedDuringEnum.Custom) {
              setCustomDateRangeOpen(true);
            }
          }}
        >
          {Object.values(ContactFilterChangedDuringEnum).map(
            (changedDuring) => (
              <MenuItem key={changedDuring} value={changedDuring}>
                {formatChangedDuringFilter(changedDuring, t)}
              </MenuItem>
            ),
          )}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel id="change-made-by-filter-label">
          {t('Change made by')}
        </InputLabel>
        <Select
          labelId="change-made-by-filter-label"
          label={t('Change made by')}
          value={madeBy ?? ''}
          onChange={(event) => onMadeByChange(event.target.value || null)}
        >
          <MenuItem value="">{t('Anyone')}</MenuItem>
          {automaticOptions.length > 0 && (
            <ListSubheader>{t('Automatic')}</ListSubheader>
          )}
          {automaticOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          {mpdxOptions.length > 0 && (
            <ListSubheader>
              {t('In {{appName}}', {
                appName: sourceToStr(t, manualSourceValue),
              })}
            </ListSubheader>
          )}
          {mpdxOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {customDateRangeOpen && (
        <CustomDateRangeModal
          initialRange={dateRange}
          handleClose={handleClose}
          handleApply={handleApply}
        />
      )}
    </Box>
  );
};
