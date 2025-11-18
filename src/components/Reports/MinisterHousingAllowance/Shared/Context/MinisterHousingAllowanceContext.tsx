import { createContext, useContext, useMemo, useState } from 'react';
import { useNewStepList } from 'src/hooks/useNewStepList';
import { Steps } from '../../Steps/StepsList/StepsList';
import { PageEnum, StepsEnum } from '../sharedTypes';

export type ContextType = {
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;

  currentStep: StepsEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;

  pageType: PageEnum | undefined;

  hasCalcValues: boolean;
  setHasCalcValues: (value: boolean) => void;

  isPrint: boolean;
  setIsPrint: (value: boolean) => void;

  isViewPage?: boolean;
  setIsViewPage: (value: boolean) => void;
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
  type?: PageEnum;
  children?: React.ReactNode;
}

export const MinisterHousingAllowanceProvider: React.FC<Props> = ({
  type,
  children,
}) => {
  const pageType = type;
  const steps = type ? useNewStepList(type) : [];
  const totalSteps = steps.length;

  const actionRequired = pageType === PageEnum.Edit;
  const [hasCalcValues, setHasCalcValues] = useState(
    actionRequired ? true : false,
  );

  const [isPrint, setIsPrint] = useState(false);
  const [isViewPage, setIsViewPage] = useState(
    type === PageEnum.View ? true : false,
  );

  const [currentStep, setCurrentStep] = useState(StepsEnum.AboutForm);
  const [percentComplete, setPercentComplete] = useState(25);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextStep = () => {
    setCurrentStep((prevStep) => {
      const next =
        prevStep === StepsEnum.AboutForm
          ? StepsEnum.RentOrOwn
          : prevStep === StepsEnum.RentOrOwn
            ? StepsEnum.CalcForm
            : prevStep === StepsEnum.CalcForm
              ? StepsEnum.Receipt
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
        prevStep === StepsEnum.RentOrOwn
          ? StepsEnum.AboutForm
          : prevStep === StepsEnum.CalcForm
            ? StepsEnum.RentOrOwn
            : prevStep === StepsEnum.Receipt
              ? StepsEnum.CalcForm
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

  const contextValue = useMemo(
    () => ({
      steps,
      currentIndex,
      currentStep,
      percentComplete,
      handleNextStep,
      handlePreviousStep,
      pageType,
      hasCalcValues,
      setHasCalcValues,
      isPrint,
      setIsPrint,
      isViewPage,
      setIsViewPage,
    }),
    [
      steps,
      currentIndex,
      currentStep,
      percentComplete,
      handleNextStep,
      handlePreviousStep,
      pageType,
      hasCalcValues,
      setHasCalcValues,
      isPrint,
      setIsPrint,
      isViewPage,
      setIsViewPage,
    ],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
