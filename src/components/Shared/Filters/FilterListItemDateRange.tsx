import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateTime, Interval } from 'luxon';
import { useTranslation } from 'react-i18next';
import { CustomDateField } from 'src/components/common/DateTimePickers/CustomDateField';
import { DateRangeInput, DaterangeFilter } from 'src/graphql/types.generated';

interface Props {
  filter: DaterangeFilter;
  value?: DateRangeInput | null;
  onUpdate: (value?: DateRangeInput) => void;
}

const StyledDateField = styled(CustomDateField)(({ theme }) => ({
  '.MuiInputBase-input': {
    fontSize: '0.9rem',
  },
  '.MuiIconButton-root': {
    marginInline: theme.spacing(-1.5),
  },
}));

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
        <StyledDateField
          label={t('Start Date')}
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
          style={{ marginRight: '8px' }}
        />
        <StyledDateField
          label={t('End Date')}
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
          style={{ marginLeft: '8px', fontSize: '0.9rem' }}
        />
      </ListItem>
    </>
  );
};
