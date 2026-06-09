import React from 'react';
import { List, ListItemButton } from '@mui/material';
import { CategoryListItemStyles } from 'src/components/HrTools/Shared/CalculationReports/Shared/styledComponents/StepsListStyles';
import { ListItemContent } from 'src/components/HrTools/Shared/CalculationReports/StepsList/ListItemContent';
import { useNsGoalCalculator } from './NsGoalCalculatorContext';

export const NsGoalCalculatorStepsList: React.FC = () => {
  const { steps, currentStep, handleStepChange } = useNsGoalCalculator();

  const currentIndex = steps.findIndex(
    (step) => step.step === currentStep.step,
  );

  return (
    <List disablePadding>
      {steps.map((step, index) => {
        const current = step.step === currentStep.step;
        return (
          <ListItemButton
            key={step.step}
            sx={CategoryListItemStyles}
            aria-current={current ? 'step' : undefined}
            onClick={() => handleStepChange(step.step)}
          >
            <ListItemContent
              title={`${index + 1}. ${step.title}`}
              complete={index < currentIndex}
              current={current}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};
