import { ListItem, ListItemText, TextField } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NumericRangeFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: NumericRangeFilter;
  value?: string;
  onUpdate: (value?: string) => void;
}

export const FilterListItemNumericRange: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  const { t } = useTranslation();
  debugger;
  const range = value?.split('..');

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
          value={(range && range[0]) ?? null}
          onChange={({ target: { value: min } }) =>
            onUpdate(
              !min
                ? undefined
                : createRange(
                    min,
                    range && range[1] && range[1] > min ? range[1] : min,
                  ),
            )
          }
        />
        <TextField
          type="number"
          placeholder={t('max')}
          style={{ marginLeft: '8px' }}
          value={(range && range[1]) ?? null}
          onChange={({ target: { value: max } }) =>
            onUpdate(
              !max
                ? undefined
                : createRange(
                    range && range[0] && range[0] < max ? range[0] : max,
                    max,
                  ),
            )
          }
        />
      </ListItem>
    </>
  );
};
