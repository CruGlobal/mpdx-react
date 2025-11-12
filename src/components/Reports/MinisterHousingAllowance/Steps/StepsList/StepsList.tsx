import React from 'react';
import { List, ListItem } from '@mui/material';
import { CategoryListItemStyles } from '../../styledComponents/styledComponents';
import { ListItemContent } from './ListItemContent';

export interface Steps {
  title: string;
  current: boolean;
  complete: boolean;
}

interface StepsListProps {
  steps: Steps[];
}

export const StepsList: React.FC<StepsListProps> = ({ steps }) => {
  return (
    <List disablePadding>
      {steps.map(({ title, complete, current }, index) => (
        <ListItem key={index} sx={CategoryListItemStyles}>
          <ListItemContent
            title={title}
            complete={complete}
            current={current}
          />
        </ListItem>
      ))}
    </List>
  );
};
