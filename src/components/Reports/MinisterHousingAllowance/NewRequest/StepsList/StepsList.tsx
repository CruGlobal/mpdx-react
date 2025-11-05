import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { List, ListItem, ListItemText } from '@mui/material';
import {
  CategoryListItemIcon,
  CategoryListItemStyles,
} from '../../styledComponents/CategoryListItemStyles';

interface ListItemContentProps {
  title: string;
  complete: boolean;
  current: boolean;
}

const ListItemContent: React.FC<ListItemContentProps> = ({
  title,
  complete,
  current,
}) => (
  <>
    <CategoryListItemIcon
      sx={(theme) => ({
        color: complete
          ? 'success.main'
          : current
            ? theme.palette.mpdxBlue.main
            : theme.palette.cruGrayDark.main,
      })}
    >
      {complete ? (
        <CheckCircleIcon />
      ) : current ? (
        <CircleIcon />
      ) : (
        <RadioButtonUncheckedIcon />
      )}
    </CategoryListItemIcon>
    <ListItemText
      primary={title}
      primaryTypographyProps={{ variant: 'body2' }}
    />
  </>
);

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
