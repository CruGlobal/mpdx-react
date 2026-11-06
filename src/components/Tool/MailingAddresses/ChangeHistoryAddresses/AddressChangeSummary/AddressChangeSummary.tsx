import React from 'react';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'src/components/Shared/Filters/ChangedDuring/changedDuring';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';

interface AddressChangeSummaryProps {
  changeCount: number;
  partnerCount: number;
  automaticCount: number;
  dateRange: DateRange | null;
}

export const AddressChangeSummary: React.FC<AddressChangeSummaryProps> = ({
  changeCount,
  partnerCount,
  automaticCount,
  dateRange,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const changes = t('{{count}} address changes', { count: changeCount });
  const partners = t('{{count}} partners', { count: partnerCount });

  const startDate = dateFormat(dateRange?.startDate ?? null, locale);
  const endDate = dateFormat(dateRange?.endDate ?? null, locale);
  const dateRangeText =
    startDate && endDate
      ? t('{{startDate}} to {{endDate}}', { startDate, endDate })
      : startDate
        ? t('Since {{startDate}}', { startDate })
        : endDate
          ? t('Through {{endDate}}', { endDate })
          : null;

  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      columnGap={3}
      rowGap={1}
      px={2}
      py={1.5}
      sx={{ backgroundColor: 'mpdxBlue.light', borderRadius: 1 }}
    >
      <Typography variant="body2" fontWeight="bold" color="mpdxBlue.main">
        {t('{{changes}} for {{partners}}', { changes, partners })}
      </Typography>
      {dateRangeText && (
        <Typography variant="body2" color="mpdxBlue.main">
          {dateRangeText}
        </Typography>
      )}
      <Box display="flex" alignItems="center" gap={0.5} color="mpdxBlue.main">
        <SyncIcon fontSize="small" />
        <Typography variant="body2">
          {t('{{count}} were automatic', { count: automaticCount })}
        </Typography>
      </Box>
    </Box>
  );
};
