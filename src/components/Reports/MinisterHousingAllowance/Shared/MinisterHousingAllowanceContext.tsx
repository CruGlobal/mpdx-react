import { createContext, useContext, useMemo, useState } from 'react';
import { NewRequestStep, useNewStepList } from 'src/hooks/useNewStepList';
import { NewRequestStepsEnum } from './sharedTypes';

export type ContextType = {
  steps: NewRequestStep[];
  currentStep: NewRequestStepsEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  percentComplete: number;
};

const MinisterHousingAllowanceContext = createContext<ContextType | null>(null);

export const useMinisterHousingAllowance = (): ContextType => {
  const context = useContext(MinisterHousingAllowanceContext);
  if (context === null) {
    throw new Error(
      'Could not find MinisterHousingAllowanceContext. Make sure that your component is inside <MinisterHousingAllowanceProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const MinisterHousingAllowanceProvider: React.FC<Props> = ({
  children,
}) => {
  const steps = useNewStepList();

  const [currentStep, setCurrentStep] = useState(NewRequestStepsEnum.AboutForm);
  const [percentComplete, setPercentComplete] = useState(25);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === NewRequestStepsEnum.AboutForm
          ? NewRequestStepsEnum.RentOrOwn
          : prevStep === NewRequestStepsEnum.RentOrOwn
            ? NewRequestStepsEnum.Calculate
            : prevStep === NewRequestStepsEnum.Calculate
              ? NewRequestStepsEnum.Receipt
              : prevStep;

      handlePercentComplete(next);
      handleNextIndexChange(currentIndex + 1);
      return next;
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === NewRequestStepsEnum.RentOrOwn
          ? NewRequestStepsEnum.AboutForm
          : prevStep === NewRequestStepsEnum.Calculate
            ? NewRequestStepsEnum.RentOrOwn
            : prevStep === NewRequestStepsEnum.Receipt
              ? NewRequestStepsEnum.Calculate
              : prevStep;

      handlePercentComplete(next);
      handlePreviousIndexChange(currentIndex - 1);
      return next;
    });
  };

  const handlePercentComplete = (step: NewRequestStepsEnum) => {
    switch (step) {
      case NewRequestStepsEnum.AboutForm:
        setPercentComplete(25);
        break;
      case NewRequestStepsEnum.RentOrOwn:
        setPercentComplete(50);
        break;
      case NewRequestStepsEnum.Calculate:
        setPercentComplete(75);
        break;
      case NewRequestStepsEnum.Receipt:
        setPercentComplete(100);
        break;
      default:
        setPercentComplete(0);
    }
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

  const contextValue = useMemo(
    () => ({
      steps,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      percentComplete,
    }),
    [steps, currentStep, handleNextStep, handlePreviousStep, percentComplete],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
