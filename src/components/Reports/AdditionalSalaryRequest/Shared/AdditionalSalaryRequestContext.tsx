import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useStepList } from 'src/hooks/useStepList';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;

  currentStep: AdditionalSalaryRequestSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;

  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  handleCancel: () => void;
};

const AdditionalSalaryRequestContext =
  createContext<AdditionalSalaryRequestType | null>(null);

export const useAdditionalSalaryRequest = (): AdditionalSalaryRequestType => {
  const context = React.useContext(AdditionalSalaryRequestContext);
  if (context === null) {
    throw new Error(
      'Could not find AdditionalSalaryRequestContext. Make sure that your component is inside <AdditionalSalaryRequestProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  children,
}) => {
  const steps = useStepList(FormEnum.AdditionalSalary);
  const totalSteps = steps.length;

  // Step Handlers
  const [currentStep, setCurrentStep] = useState(
    AdditionalSalaryRequestSectionEnum.AboutForm,
  );
  const [percentComplete, setPercentComplete] = useState(33);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === AdditionalSalaryRequestSectionEnum.AboutForm
          ? AdditionalSalaryRequestSectionEnum.CompleteForm
          : prevStep === AdditionalSalaryRequestSectionEnum.CompleteForm
            ? AdditionalSalaryRequestSectionEnum.Receipt
            : prevStep;

      const newIndex = currentIndex + 1;
      handleNextIndexChange(newIndex);
      handlePercentComplete(newIndex);
      return next;
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === AdditionalSalaryRequestSectionEnum.CompleteForm
          ? AdditionalSalaryRequestSectionEnum.AboutForm
          : prevStep === AdditionalSalaryRequestSectionEnum.Receipt
            ? AdditionalSalaryRequestSectionEnum.CompleteForm
            : prevStep;

      const newIndex = currentIndex - 1;
      handlePreviousIndexChange(newIndex);
      handlePercentComplete(newIndex);
      return next;
    });
  };

  const handlePercentComplete = (index: number) => {
    const newPercent = Math.round(((index + 1) / totalSteps) * 100);
    setPercentComplete(newPercent);
  };

  const handleNextIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[currentIndex].complete = true;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;

    if (newIndex === steps.length - 1) {
      steps[newIndex].complete = true;
    }
  };

  const handlePreviousIndexChange = (newIndex: number) => {
    steps[currentIndex].current = false;
    steps[newIndex].complete = false;
    setCurrentIndex(newIndex);
    steps[newIndex].current = true;
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const handleCancel = () => {
    // Implement cancel logic here
  };

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      steps,
      currentIndex,
      percentComplete,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
      handleCancel,
    }),
    [
      steps,
      currentIndex,
      percentComplete,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
    ],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
