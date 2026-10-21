import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { formatAddressChangedFilter } from 'src/components/Shared/Filters/ChangedDuring/changedDuring';
import { useUrlFilters } from 'src/components/Shared/UrlFiltersProvider/UrlFiltersProvider';
import { useLocale } from 'src/hooks/useLocale';

export const addressChangedFilterBarHeight = '48px';

export const AddressChangedFilterBar: React.FC = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { activeFilters, setActiveFilters } = useUrlFilters();

  const handleClear = () => {
    const {
      addressChanged: _addressChanged,
      addressChangedIncludeAutomatic: _addressChangedIncludeAutomatic,
      ...otherFilters
    } = activeFilters;
    setActiveFilters(otherFilters);
  };

  const range = activeFilters.addressChanged;
  if (!range) {
    return null;
  }

  const filter = formatAddressChangedFilter(range, t, locale);
  const includeAutomatic =
    activeFilters.addressChangedIncludeAutomatic !== false;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      px={2}
      height={addressChangedFilterBarHeight}
      sx={{ backgroundColor: 'mpdxBlue.light' }}
    >
      <Typography variant="body2" color="mpdxBlue.main">
        {includeAutomatic ? (
          <Trans
            t={t}
            defaults="Filtered by <bold>{{filter}}</bold>"
            values={{ filter }}
            components={{ bold: <strong /> }}
            shouldUnescape
          />
        ) : (
          <Trans
            t={t}
            defaults="Filtered by <bold>{{filter}}</bold> and <bold>excluding automatic updates</bold>"
            values={{ filter }}
            components={{ bold: <strong /> }}
            shouldUnescape
          />
        )}
      </Typography>
      <Button size="small" onClick={handleClear} sx={{ fontWeight: 'bold' }}>
        {t('Clear')}
      </Button>
    </Box>
  );
};
