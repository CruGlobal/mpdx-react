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

const partnerOptions = [
  ContactFilterPartnerEnum.GaveOneOrMore,
  ContactFilterPartnerEnum.GaveLastTwoYears,
  ContactFilterPartnerEnum.Lost,
];

interface AddressFiltersProps {
  partners: ContactFilterPartnerEnum;
  onPartnersChange: (partners: ContactFilterPartnerEnum) => void;
  changedDuring: ContactFilterChangedDuringEnum | null;
  onChangedDuringChange: (
    changedDuring: ContactFilterChangedDuringEnum | null,
  ) => void;
  dateRange: DateRange | null;
  onDateRangeChange: (dateRange: DateRange) => void;
  madeBy: string | null;
  madeByOptions: MadeByOption[];
  onMadeByChange: (madeBy: string | null) => void;
}

export const AddressFilters: React.FC<AddressFiltersProps> = ({
  partners,
  onPartnersChange,
  changedDuring,
  onChangedDuringChange,
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
        <InputLabel shrink id="partner-filter-label">
          {t('Partner')}
        </InputLabel>
        <Select<ContactFilterPartnerEnum>
          labelId="partner-filter-label"
          notched
          label={t('Partner')}
          value={partners}
          onChange={(event) => onPartnersChange(event.target.value)}
        >
          {partnerOptions.map((partner) => (
            <MenuItem key={partner} value={partner}>
              {formatPartnerFilter(partner, t)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel shrink id="changed-during-filter-label">
          {t('Changed during')}
        </InputLabel>
        <Select<ContactFilterChangedDuringEnum | ''>
          labelId="changed-during-filter-label"
          displayEmpty
          notched
          label={t('Changed during')}
          value={changedDuring ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            if (value !== ContactFilterChangedDuringEnum.Custom) {
              onChangedDuringChange(value || null);
            }
          }}
        >
          <MenuItem value="">{t('Any time')}</MenuItem>
          {Object.values(ContactFilterChangedDuringEnum).map((option) => (
            <MenuItem
              key={option}
              value={option}
              onClick={
                option === ContactFilterChangedDuringEnum.Custom
                  ? () => setCustomDateRangeOpen(true)
                  : undefined
              }
            >
              {formatChangedDuringFilter(option, t)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
        <InputLabel shrink id="change-made-by-filter-label">
          {t('Change made by')}
        </InputLabel>
        <Select
          labelId="change-made-by-filter-label"
          displayEmpty
          notched
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
