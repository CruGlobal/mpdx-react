import { ListItem, ListItemText } from '@material-ui/core';
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
  value;
  onUpdate: (value: string) => void;
}

export const FilterListItemDateRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  const [startDate, endDate] = ((value: string | null) =>
    value?.split('..', 2)?.map((value) => DateTime.fromISO(value) || null) ?? [
      null,
      null,
    ])(value);
  const createRange = (start: DateTime, end: DateTime) =>
    start.toISODate() + '..' + end.toISODate();

  return (
    <MuiPickersUtilsProvider utils={LuxonUtils}>
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      <ListItem>
        <DatePicker
          label="Start Date"
          clearable
          value={startDate}
          onChange={(date) =>
            onUpdate(
              !date
                ? null
                : createRange(date, endDate && endDate > date ? endDate : date),
            )
          }
          format="MM/dd/yyyy"
        />
      </ListItem>
      <ListItem>
        <DatePicker
          label="End Date"
          clearable
          disablePast={false}
          value={endDate}
          onChange={(date) =>
            onUpdate(
              !date
                ? null
                : createRange(
                    startDate && startDate < date ? startDate : date,
                    date,
                  ),
            )
          }
          format="MM/dd/yyyy"
        />
      </ListItem>
    </MuiPickersUtilsProvider>
  );
};
