import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ContactFilterPartnerEnum } from 'src/graphql/types.generated';
import {
  ContactFilterChangedDuringEnum,
  formatChangedDuringFilter,
  formatPartnerFilter,
} from '../helpers';

export const AddressFilters: React.FC = () => {
  const { t } = useTranslation();

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
        >
          {/* TODO: Replace this with actual options for "Change made by" filter */}
          <MenuItem key="temporary-option" value="temporary-option">
            {t('Temporary option')}
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
