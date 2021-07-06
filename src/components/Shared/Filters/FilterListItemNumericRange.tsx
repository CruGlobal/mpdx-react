import { ListItem } from '@material-ui/core';
import React from 'react';
import { NumericRangeFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: NumericRangeFilter;
  value?: string;
  onUpdate: (value: string) => void;
}

export const FilterListItemNumericRange: React.FC<Props> = ({}: Props) => {
  return <ListItem>Numeric</ListItem>;
};
