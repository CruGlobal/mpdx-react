import React from 'react';
import { List, ListItem } from '@mui/material';
import { CategoryListItemStyles } from 'src/components/HrTools/Shared/CalculationReports/Shared/styledComponents/StepsListStyles';
import { ListItemContent } from 'src/components/HrTools/Shared/CalculationReports/StepsList/ListItemContent';

export interface SubStep {
  id: string;
  title: string;
}

interface SubStepListProps {
  subSteps: SubStep[];
  currentSubStepId: string;
}

/**
 * Renders the sidebar list of sub-steps for a single view step (page). Each page owns its own list,
 * so the contents and completion state are local to the current page, not the questionnaire as a
 * whole.
 */
export const SubStepList: React.FC<SubStepListProps> = ({
  subSteps,
  currentSubStepId,
}) => {
  const currentIndex = subSteps.findIndex(
    (subStep) => subStep.id === currentSubStepId,
  );

  return (
    <List disablePadding>
      {subSteps.map((subStep, index) => {
        const current = subStep.id === currentSubStepId;
        return (
          <ListItem
            key={subStep.id}
            sx={CategoryListItemStyles}
            aria-current={current ? 'step' : undefined}
          >
            <ListItemContent
              title={`${index + 1}. ${subStep.title}`}
              complete={index < currentIndex}
              current={current}
            />
          </ListItem>
        );
      })}
    </List>
  );
};
