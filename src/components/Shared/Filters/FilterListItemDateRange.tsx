import { ListItem, ListItemText } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import React from 'react';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
  value?: string;
  onUpdate: (value?: string) => void;
}

export const FilterListItemDateRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const [startDate, endDate] = value
    ?.split('..', 2)
    ?.map((value) => DateTime.fromISO(value) || null) ?? [null, null];
  const createRange = (start: DateTime, end: DateTime) =>
    start.toISODate() + '..' + end.toISODate();

  return (
    <>
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      <ListItem>
        <DatePicker
          placeholder={t('Start Date')}
          style={{ marginRight: '8px' }}
          clearable
          value={startDate}
          onChange={(date) =>
            onUpdate(
              !date
                ? undefined
                : createRange(date, endDate && endDate > date ? endDate : date),
            )
          }
          format="MM/dd/yyyy"
        />
        <DatePicker
          placeholder={t('End Date')}
          style={{ marginLeft: '8px' }}
          clearable
          value={endDate}
          onChange={(date) =>
            onUpdate(
              !date
                ? undefined
                : createRange(
                    startDate && startDate < date ? startDate : date,
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
