import React, { createContext, useCallback, useMemo, useState } from 'react';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { HouseholdStaff, useHouseholdStaff } from './useHouseholdStaff';
import { NsoMpdQuestionnaireStep, useSteps } from './useSteps';

export type NsoMpdQuestionnaireType = {
  steps: NsoMpdQuestionnaireStep[];
  currentStep: NsoMpdQuestionnaireStep;
  currentIndex: number;
  isLastStep: boolean;
  isDrawerOpen: boolean;
  handleStepChange: (step: NsoMpdQuestionnaireStepEnum) => void;
  handleContinue: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
} & HouseholdStaff;

const NsoMpdQuestionnaireContext =
  createContext<NsoMpdQuestionnaireType | null>(null);

export const useNsoMpdQuestionnaire = (): NsoMpdQuestionnaireType => {
  const context = React.useContext(NsoMpdQuestionnaireContext);
  if (context === null) {
    throw new Error(
      'Could not find NsoMpdQuestionnaireContext. Make sure that your component is inside <NsoMpdQuestionnaireProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const NsoMpdQuestionnaireProvider: React.FC<Props> = ({ children }) => {
  const steps = useSteps();
  const householdStaff = useHouseholdStaff();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
  }, []);

  const handleStepChange = useCallback(
    (newStep: NsoMpdQuestionnaireStepEnum) => {
      const newIndex = steps.findIndex((step) => step.step === newStep);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      }
    },
    [steps],
  );

  const handleContinue = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [steps, currentIndex]);

  const contextValue = useMemo(
    (): NsoMpdQuestionnaireType => ({
      steps,
      currentStep,
      currentIndex,
      isLastStep,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      toggleDrawer,
      setDrawerOpen,
      ...householdStaff,
    }),
    [
      steps,
      currentStep,
      currentIndex,
      isLastStep,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      toggleDrawer,
      setDrawerOpen,
      householdStaff,
    ],
  );

  return (
    <NsoMpdQuestionnaireContext.Provider value={contextValue}>
      {children}
    </NsoMpdQuestionnaireContext.Provider>
  );
};
