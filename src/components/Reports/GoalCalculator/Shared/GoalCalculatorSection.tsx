import React from 'react';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton, Typography, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGoalCalculator } from './GoalCalculatorContext';

const SectionContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(4),
}));

interface GoalCalculatorSectionProps {
  title: string;
  rightPanelContent?: JSX.Element;
  children: React.ReactNode;
}

export const GoalCalculatorSection: React.FC<GoalCalculatorSectionProps> = ({
  title,
  rightPanelContent,
  children,
}) => {
  const { setRightPanelContent } = useGoalCalculator();
  const { t } = useTranslation();

  return (
    <SectionContainer>
      <Typography variant="h6">
        {title}
        {rightPanelContent && (
          <IconButton
            onClick={() => {
              rightPanelContent && setRightPanelContent(rightPanelContent);
            }}
            aria-label={t('Show additional info')}
          >
            <InfoIcon />
          </IconButton>
        )}
      </Typography>
      {children}
    </SectionContainer>
  );
};
