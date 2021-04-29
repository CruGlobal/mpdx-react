import {
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import React from 'react';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
  selected?: Array<string>;
  onUpdate: (value?: Array<string>) => void;
}

export const FilterListItemMultiselect: React.FC<Props> = ({
  filter,
  selected,
  onUpdate,
}: Props) => {
  const isChecked = (value?: string | null) =>
    selected && selected.some((it) => it === value);

  const toggleValue = (value?: string | null) => {
    if (value && !isChecked(value)) {
      onUpdate(selected ? [...selected, value] : [value]);
    } else {
      onUpdate(selected?.filter((it) => it !== value));
    }
  };

  return (
    <div className="FilterListItemMultiselect-root">
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      {filter.options.map(({ id, name }) => (
        <ListItem key={id} button onClick={() => toggleValue(id)}>
          <ListItemIcon>
            <Checkbox
              size="small"
              edge="start"
              color="primary"
              checked={isChecked(id)}
              disableRipple
            />
          </ListItemIcon>
          <ListItemText
            primary={name}
            primaryTypographyProps={{ variant: 'subtitle1' }}
          />
        </ListItem>
      ))}
    </div>
  );
};
