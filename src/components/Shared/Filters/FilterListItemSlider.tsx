import { ListItem, ListItemText, Slider } from '@mui/material';
import React from 'react';
import {
  NumericRangeFilter,
  NumericRangeInput,
} from '../../../../graphql/types.generated';

interface Props {
  filter: NumericRangeFilter;
  value?: NumericRangeInput | null;
  onUpdate: (value?: NumericRangeInput) => void;
}

export const FilterListItemSlider: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  const valueMin = filter.min;
  const valueMax = filter.max;

  const onChange = (values: number | number[]) => {
    onUpdate({ min: values[0], max: values[1] });
  };

  return (
    <>
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      <ListItem>
        <Slider
          data-testid="sliderFilter"
          sx={(theme) => ({ marginX: theme.spacing(1) })}
          getAriaLabel={() => filter.title}
          value={[value?.min ?? valueMin, value?.max ?? valueMax]}
          valueLabelDisplay="auto"
          min={valueMin}
          max={valueMax}
          marks={[
            { value: valueMin, label: valueMin },
            { value: valueMax, label: valueMax },
          ]}
          onChange={(_event, values) => onChange(values as number[])}
        />
      </ListItem>
    </>
  );
};
