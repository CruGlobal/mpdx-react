import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SxProps,
  Theme,
  styled,
} from '@mui/material';

const categoryListItemStyles: SxProps<Theme> = (theme) => ({
  '.MuiSvgIcon-root': {
    fontSize: '1rem',
  },
  padding: 0,
  paddingLeft: theme.spacing(3),
});

const CategoryListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 'auto',
  marginRight: theme.spacing(0.5),
}));

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
        <ListItem key={index} sx={categoryListItemStyles}>
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
