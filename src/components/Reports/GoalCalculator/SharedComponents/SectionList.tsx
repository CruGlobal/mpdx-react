import React from 'react';
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
}

const ListItemContent: React.FC<ListItemContentProps> = ({
  title,
  complete,
}) => (
  <>
    <CategoryListItemIcon
      sx={(theme) => ({
        color: complete
          ? theme.palette.mpdxBlue.main
          : theme.palette.cruGrayDark.main,
      })}
    >
      {complete ? <CircleIcon /> : <RadioButtonUncheckedIcon />}
    </CategoryListItemIcon>
    <ListItemText
      primary={title}
      primaryTypographyProps={{ variant: 'body2' }}
    />
  </>
);

export interface SectionItem {
  title: string;
  complete: boolean;
}

interface SectionListProps {
  sections: SectionItem[];
}

export const SectionList: React.FC<SectionListProps> = ({ sections }) => (
  <List disablePadding>
    {sections.map(({ title, complete }, index) => (
      <ListItem key={index} sx={categoryListItemStyles}>
        <ListItemContent title={title} complete={complete} />
      </ListItem>
    ))}
  </List>
);
