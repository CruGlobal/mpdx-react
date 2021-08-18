import { ListItem, ListItemText } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import React from 'react';
import { DateTime, Interval } from 'luxon';
import { useTranslation } from 'react-i18next';
import { DaterangeFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: DaterangeFilter;
  value?: string;
  onUpdate: (value?: string) => void;
}

export const FilterListItemDateRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}) => {
  const { t } = useTranslation();

  const range = value ? Interval.fromISO(value.replace('..', '/')) : undefined;
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
        <DatePicker
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
