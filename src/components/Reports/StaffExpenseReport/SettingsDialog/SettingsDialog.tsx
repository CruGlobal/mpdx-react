import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';

enum DateRange {
  WeekToDate,
  MonthToDate,
  YearToDate,
}

interface SettingsDialogProps {
  isOpen: boolean;
  selectedFilters?: Filters;
  onClose: (filters?: Filters) => void;
}

export interface Filters {
  selectedDateRange?: DateRange | null;
  startDate?: DateTime | null;
  endDate?: DateTime | null;
  // change to enum array when category data is provided
  categories?: string[];
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  selectedFilters,
}) => {
  const { t } = useTranslation();

  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(
    selectedFilters?.selectedDateRange || null,
  );
  const [startDate, setStartDate] = useState<DateTime | null>(
    selectedFilters?.startDate || null,
  );
  const [endDate, setEndDate] = useState<DateTime | null>(
    selectedFilters?.endDate || null,
  );
  const [categories, setCategories] = useState<string[]>(
    selectedFilters?.categories || [],
  );

  const handleDateRangeChange = (event) => {
    const value = event.target.value;
    if (value === '') {
      setSelectedDateRange(null);
      return;
    }
    setSelectedDateRange(value);
    setStartDate(null);
    setEndDate(null);
  };

  const handleSetStartDate = (date: DateTime | null) => {
    setStartDate(date);
    if (date) {
      setSelectedDateRange(null);
    }
  };

  const handleSetEndDate = (date: DateTime | null) => {
    setEndDate(date);
    if (date) {
      setSelectedDateRange(null);
    }
  };

  const handleCategoryChange = (category: string) => {
    setCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleCancelClose = () => {
    onClose(selectedFilters);
  };

  const handleApplySettings = () => {
    const filters: Filters = {
      selectedDateRange,
      startDate: startDate,
      endDate: endDate,
      categories: categories,
    };

    onClose(filters);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('Report Settings')}</DialogTitle>
      <DialogContent>
        <Box mb={2} />
        <Box>
          <TextField
            select
            label={t('Select Date Range')}
            fullWidth
            value={selectedDateRange}
            onChange={handleDateRangeChange}
          >
            <MenuItem value="">{t('None')}</MenuItem>
            <MenuItem value={DateRange.WeekToDate}>
              {t('Week to Date')}
            </MenuItem>
            <MenuItem value={DateRange.MonthToDate}>
              {t('Month to Date')}
            </MenuItem>
            <MenuItem value={DateRange.YearToDate}>
              {t('Year to Date')}
            </MenuItem>
          </TextField>
        </Box>

        <Box mb={2} mt={2}>
          <Typography>{t('Or enter a custom date range:')}</Typography>
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          gap={2}
        >
          <Box sx={{ flex: 1 }}>
            <CustomDateField
              label={t('Start Date')}
              value={startDate}
              onChange={handleSetStartDate}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            {/* At some point we probably want to ensure end date is not in the future */}
            <CustomDateField
              label={t('End Date')}
              value={endDate}
              onChange={handleSetEndDate}
              fullWidth
            />
          </Box>
        </Box>

        {startDate && endDate && startDate > endDate && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="error">
              {t('Start date cannot be after end date.')}
            </Typography>
          </Box>
        )}

        {(startDate || endDate) &&
          !(startDate && endDate && startDate > endDate) && (
            <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
              <Typography variant="body2" color="primary">
                {t('Custom Date Range:')}{' '}
                {startDate
                  ? startDate.toFormat('MM/dd/yyyy')
                  : t('No start date')}{' '}
                - {endDate ? endDate.toFormat('MM/dd/yyyy') : t('Current date')}
              </Typography>
            </Box>
          )}

        {selectedDateRange !== null && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="body2" color="primary">
              {t('Selected Range:')}{' '}
              {selectedDateRange === DateRange.WeekToDate && t('Week to Date')}
              {selectedDateRange === DateRange.MonthToDate &&
                t('Month to Date')}
              {selectedDateRange === DateRange.YearToDate && t('Year to Date')}
            </Typography>
          </Box>
        )}

        <Typography mt={2}>
          If you like, you can consolidate data by category into single rows.
          This may be useful when using long date ranges, such as &quot;Year to
          Date.&quot; Select which categories of items you wish to consolidate
          (each category is still kept separate from the other categories).{' '}
        </Typography>
        <Typography mt={2}>Select Categories: </Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={categories.includes('Benefits')}
                onChange={() => handleCategoryChange('Benefits')}
              />
            }
            label={t('Benefits')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={categories.includes('Contributions')}
                onChange={() => handleCategoryChange('Contributions')}
              />
            }
            label={t('Contributions')}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={categories.includes('Salary')}
                onChange={() => handleCategoryChange('Salary')}
              />
            }
            label={t('Salary')}
          />
        </FormGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancelClose} color="secondary">
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleApplySettings}
          color="primary"
          variant="contained"
          disabled={Boolean(
            !(
              selectedDateRange !== null ||
              startDate !== null ||
              endDate !== null ||
              categories.length > 0
            ) ||
              (startDate && endDate && startDate > endDate),
          )}
        >
          {t('Apply Settings')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
