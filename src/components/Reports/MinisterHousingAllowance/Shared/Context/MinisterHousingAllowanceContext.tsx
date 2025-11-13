import { createContext, useContext, useMemo, useState } from 'react';
import { useNewStepList } from 'src/hooks/useNewStepList';
import { Steps } from '../../Steps/StepsList/StepsList';
import {
  EditRequestStepsEnum,
  NewRequestStepsEnum,
  PageEnum,
} from '../sharedTypes';

export type ContextType = {
  // list of steps for new or edit request
  steps: Steps[];
  currentIndex: number;

  // new request state and handlers
  currentStep: NewRequestStepsEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  percentComplete: number;

  // edit request state and handlers
  currentEditStep: EditRequestStepsEnum;
  handleEditNextStep: () => void;
  handleEditPreviousStep: () => void;
  percentEditComplete: number;

  // new or edit page type
  pageType: PageEnum | undefined;

  // calculation values state
  hasCalcValues: boolean;
  setHasCalcValues: (value: boolean) => void;
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

  const [hasCalcValues, setHasCalcValues] = useState(
    type === PageEnum.Edit ? true : false,
  );

  const [currentStep, setCurrentStep] = useState(NewRequestStepsEnum.AboutForm);
  const [percentComplete, setPercentComplete] = useState(25);

  const [currentEditStep, setCurrentEditStep] = useState(
    EditRequestStepsEnum.RentOrOwn,
  );
  const [percentEditComplete, setPercentEditComplete] = useState(33);

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

  const handleEditNextStep = () => {
    setCurrentEditStep((prevStep) => {
      const next =
        prevStep === EditRequestStepsEnum.RentOrOwn
          ? EditRequestStepsEnum.Edit
          : prevStep === EditRequestStepsEnum.Edit
            ? EditRequestStepsEnum.Receipt
            : prevStep;

      handleEditPercentComplete(next);
      handleNextIndexChange(currentIndex + 1);
      return next;
    });
  };

  const handleEditPreviousStep = () => {
    setCurrentEditStep((prevStep) => {
      const next =
        prevStep === EditRequestStepsEnum.Edit
          ? EditRequestStepsEnum.RentOrOwn
          : prevStep === EditRequestStepsEnum.Receipt
            ? EditRequestStepsEnum.Edit
            : prevStep;

      handleEditPercentComplete(next);
      handlePreviousIndexChange(currentIndex - 1);
      return next;
    });
  };

  const handleEditPercentComplete = (step: EditRequestStepsEnum) => {
    switch (step) {
      case EditRequestStepsEnum.RentOrOwn:
        setPercentEditComplete(33);
        break;
      case EditRequestStepsEnum.Edit:
        setPercentEditComplete(66);
        break;
      case EditRequestStepsEnum.Receipt:
        setPercentEditComplete(100);
        break;
      default:
        setPercentEditComplete(0);
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
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      percentComplete,
      currentEditStep,
      handleEditNextStep,
      handleEditPreviousStep,
      percentEditComplete,
      pageType,
      hasCalcValues,
      setHasCalcValues,
    }),
    [
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      percentComplete,
      currentEditStep,
      handleEditNextStep,
      handleEditPreviousStep,
      percentEditComplete,
      pageType,
      hasCalcValues,
      setHasCalcValues,
    ],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
