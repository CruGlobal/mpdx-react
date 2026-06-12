import React, { useState } from 'react';
import { NsoMpdQuestionnaireLayout } from './NsoMpdQuestionnaireLayout';
import { SubStep, SubStepList } from './SubStepList';

interface StepPageProps {
  subSteps: SubStep[];
  children?: React.ReactNode;
}

/**
 * Wraps a single view step's main content with the questionnaire layout, supplying that page's own
 * sub-step list to the sidebar and tracking which sub-step is currently selected.
 */
export const StepPage: React.FC<StepPageProps> = ({ subSteps, children }) => {
  const [currentSubStepId] = useState(subSteps[0]?.id);

  return (
    <NsoMpdQuestionnaireLayout
      sectionListPanel={
        <SubStepList subSteps={subSteps} currentSubStepId={currentSubStepId} />
      }
      mainContent={children}
    />
  );
};
