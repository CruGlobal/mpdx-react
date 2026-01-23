import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { ListItemText } from '@mui/material';
import { CategoryListItemIcon } from 'src/components/Reports/Shared/CalculationReports/Shared/styledComponents/StepsListStyles';

interface ListItemContentProps {
  title: string;
  complete: boolean;
  current: boolean;
}

export const ListItemContent: React.FC<ListItemContentProps> = ({
  title,
  complete,
  current,
}) => {
  return (
    <>
      <CategoryListItemIcon
        sx={(theme) => ({
          color: complete
            ? 'success.main'
            : current
              ? theme.palette.mpdxBlue.main
              : theme.palette.mpdxGrayDark.main,
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
};
