import { ListItem, ListItemText, TextField } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  NumericRangeFilter,
  NumericRangeInput,
} from '../../../../graphql/types.generated';

interface Props {
  filter: NumericRangeFilter;
  value?: NumericRangeInput;
  onUpdate: (value?: string) => void;
}

export const FilterListItemNumericRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  const { t } = useTranslation();

  const valueMin = value?.min?.toString() || undefined;
  const valueMax = value?.max?.toString() || undefined;

  const createRange = (start: string, end: string) => start + '..' + end;

  return (
    <>
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      <ListItem>
        <TextField
          type="number"
          placeholder={t('min')}
          style={{ marginRight: '8px' }}
          value={valueMin || null}
          onChange={({ target: { value: min } }) =>
            onUpdate(
              !min
                ? undefined
                : createRange(min, valueMax && valueMax > min ? valueMax : min),
            )
          }
        />
        <TextField
          type="number"
          placeholder={t('max')}
          style={{ marginLeft: '8px' }}
          value={valueMax || null}
          onChange={({ target: { value: max } }) =>
            onUpdate(
              !max
                ? undefined
                : createRange(valueMin && valueMin < max ? valueMin : max, max),
            )
          }
        />
      </ListItem>
    </>
  );
};
