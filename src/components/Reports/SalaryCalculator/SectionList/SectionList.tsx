import React from 'react';
import Circle from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import theme from 'src/theme';
import {
  SalaryCalculatorSectionEnum,
  useSectionSteps,
} from '../useSectionSteps';

export interface StepStatusItem {
  key: string;
  currentStep: boolean;
}

interface SectionListProps {
  selectedSection: SalaryCalculatorSectionEnum;
  stepStatus: StepStatusItem[];
}

export const SectionList: React.FC<SectionListProps> = ({
  selectedSection,
  stepStatus,
}) => {
  const sectionSteps = useSectionSteps();
  return (
    <List>
      {sectionSteps.map((sectionStep) => {
        const status = stepStatus.find((step) => step.key === sectionStep.key);
        return (
          <ListItem
            key={sectionStep.key}
            sx={
              selectedSection === sectionStep.key
                ? { backgroundColor: theme.palette.action.selected }
                : undefined
            }
          >
            <ListItemIcon sx={{ minWidth: 32, mr: theme.spacing(0.5) }}>
              {status?.currentStep ? (
                <Circle sx={{ color: theme.palette.primary.main }} />
              ) : (
                <RadioButtonUncheckedIcon
                  sx={{ color: theme.palette.text.primary }}
                />
              )}
            </ListItemIcon>
            <ListItemText primary={sectionStep.label} />
          </ListItem>
        );
      })}
    </List>
  );
};
