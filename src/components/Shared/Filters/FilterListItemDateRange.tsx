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

interface Props {
  filter: DaterangeFilter;
  value?: DateRangeInput;
  onUpdate: (value?: DateRangeInput) => void;
}

export const FilterListItemDateRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}) => {
  const { t } = useTranslation();

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
          renderInput={(params) => <TextField {...params} />}
          placeholder={t('Start Date')}
          style={{ marginRight: '8px' }}
          clearable
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
          format="MM/dd/yyyy"
        />
        <MobileDatePicker
          renderInput={(params) => <TextField {...params} />}
          placeholder={t('End Date')}
          style={{ marginLeft: '8px' }}
          clearable
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
          format="MM/dd/yyyy"
        />
      </ListItem>
    </>
  );
};
