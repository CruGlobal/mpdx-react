import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { List, ListItem, ListItemText, styled } from '@mui/material';
import {
  CategoryListItemIcon,
  CategoryListItemStyles,
} from 'src/components/HrTools/Shared/CalculationReports/Shared/styledComponents/StepsListStyles';

const StyledCategoryListItemIcon = styled(CategoryListItemIcon, {
  shouldForwardProp: (prop) => prop !== 'complete',
})<{ complete: boolean }>(({ theme, complete }) => ({
  color: complete
    ? theme.palette.mpdxBlue.main
    : theme.palette.mpdxGrayDark.main,
}));

export interface SubStep {
  id: string;
  title: string;
  complete: boolean;
}

interface SubStepListProps {
  subSteps: SubStep[];
  currentSubStepId: string;
}

/**
 * Renders the sidebar list of sub-steps for a single view step (page). Each page owns its own list,
 * so the contents and completion state are local to the current page, not the questionnaire as a
 * whole. A sub-step's dot is filled blue once its data has been entered; otherwise it stays
 * outlined. `currentSubStepId` only drives `aria-current` for assistive tech.
 */
export const SubStepList: React.FC<SubStepListProps> = ({
  subSteps,
  currentSubStepId,
}) => {
  return (
    <List disablePadding>
      {subSteps.map((subStep, index) => {
        const current = subStep.id === currentSubStepId;
        const { complete } = subStep;
        return (
          <ListItem
            key={subStep.id}
            sx={CategoryListItemStyles}
            aria-current={current ? 'step' : undefined}
          >
            <StyledCategoryListItemIcon complete={complete}>
              {complete ? <CircleIcon /> : <RadioButtonUncheckedIcon />}
            </StyledCategoryListItemIcon>
            <ListItemText
              primary={`${index + 1}. ${subStep.title}`}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
