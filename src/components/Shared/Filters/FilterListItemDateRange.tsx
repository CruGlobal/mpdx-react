import { ListItem, ListItemText } from '@mui/material';
import TextField from '@mui/material/TextField';
import { MobileDatePicker } from '@mui/x-date-pickers';
import React from 'react';
import { DateTime, Interval } from 'luxon';
import { useTranslation } from 'react-i18next';
import {
  DaterangeFilter,
  DateRangeInput,
} from '../../../../graphql/types.generated';
import { getDateFormatPattern } from 'src/lib/intlFormat/intlFormat';
import { useLocale } from 'src/hooks/useLocale';

interface Props {
  filter: DaterangeFilter;
  value?: DateRangeInput | null;
  onUpdate: (value?: DateRangeInput) => void;
}

export const FilterListItemDateRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();

  const range = value
    ? Interval.fromISO(value.min + '/' + value.max)
    : undefined;
  const createRange = (start: DateTime, end: DateTime): DateRangeInput => ({
    min: start.toISODate(),
    max: end.toISODate(),
  });

  return (
    <>
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      <ListItem>
        <MobileDatePicker
          renderInput={(params) => (
            <TextField
              placeholder={t('Start Date')}
              style={{ marginRight: '8px' }}
              {...params}
            />
          )}
          value={range?.start ?? null}
          onChange={(date) =>
            onUpdate(
              !date
                ? undefined
                : createRange(
                    date,
                    range?.end && range.end > date ? range.end : date,
                  ),
            )
          }
          inputFormat={getDateFormatPattern(locale)}
        />
        <MobileDatePicker
          renderInput={(params) => (
            <TextField
              placeholder={t('End Date')}
              style={{ marginLeft: '8px' }}
              {...params}
            />
          )}
          value={range?.end ?? null}
          onChange={(date) =>
            onUpdate(
              !date
                ? undefined
                : createRange(
                    range?.start && range.start < date ? range.start : date,
                    date,
                  ),
            )
          }
          inputFormat={getDateFormatPattern(locale)}
        />
      </ListItem>
    </>
  );
};
