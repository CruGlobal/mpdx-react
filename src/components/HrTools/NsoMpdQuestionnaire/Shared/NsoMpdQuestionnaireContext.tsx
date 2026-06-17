import React, { createContext, useCallback, useMemo, useState } from 'react';
import { HcmQuery, useHcmQuery } from '../../Shared/HcmData/Hcm.generated';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { NsoMpdQuestionnaireStep, useSteps } from './useSteps';

export type HcmPerson = HcmQuery['hcm'][number];

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
  hcmUser: HcmPerson | null;
  hcmSpouse: HcmPerson | null;
};

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  const { data: hcmData } = useHcmQuery();
  const hcmUser = hcmData?.hcm[0] ?? null;
  const hcmSpouse = hcmData?.hcm[1] ?? null;

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
      hcmUser,
      hcmSpouse,
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
      hcmUser,
      hcmSpouse,
    ],
  );

  return (
    <NsoMpdQuestionnaireContext.Provider value={contextValue}>
      {children}
    </NsoMpdQuestionnaireContext.Provider>
  );
};
