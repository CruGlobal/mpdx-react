import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  HcmDataMarriedQuery,
  useHcmDataMarriedQuery,
} from 'src/components/Reports/Shared/HcmData/HCMData.generated';
import { MaritalStatusEnum } from 'src/graphql/types.generated';
import { useNewStepList } from 'src/hooks/useNewStepList';
import { Steps } from '../../Steps/StepsList/StepsList';
import { PageEnum, StepsEnum } from '../sharedTypes';

export type HcmData = HcmDataMarriedQuery['hcm'][number];

export type ContextType = {
  // list of steps for new or edit request
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;

  // request page state and handlers
  currentStep: StepsEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;

  // new or edit page type
  pageType: PageEnum | undefined;

  // calculation values state
  hasCalcValues: boolean;
  setHasCalcValues: (value: boolean) => void;

  isMarried: boolean;
  userHcmData?: HcmData;
  spouseHcmData?: HcmData | null;
  preferredName: string;
  spousePreferredName: string;
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

  const { data: hcmData } = useHcmDataMarriedQuery({
    variables: {
      maritalStatus: MaritalStatusEnum.Married,
    },
  });

  const [userHcmData, setUserHcmData] = useState<HcmData>();
  const [spouseHcmData, setSpouseHcmData] = useState<HcmData | null>(null);
  const [isMarried, setIsMarried] = useState(false);

  useEffect(() => {
    if (!hcmData?.hcm?.length) {
      setUserHcmData(undefined);
      setSpouseHcmData(null);
      setIsMarried(false);
      return;
    }
    const [user, spouse] = hcmData.hcm;
    setUserHcmData(user);
    setSpouseHcmData(spouse ?? null);
    setIsMarried(!!spouse);
  }, [hcmData]);

  const preferredName = useMemo(
    () => userHcmData?.staffInfo?.preferredName || '',
    [userHcmData],
  );
  const spousePreferredName = useMemo(
    () => spouseHcmData?.staffInfo?.preferredName || '',
    [spouseHcmData],
  );

  const actionRequired = pageType === PageEnum.Edit;
  const [hasCalcValues, setHasCalcValues] = useState(actionRequired);

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
      isMarried,
      userHcmData,
      spouseHcmData,
      preferredName,
      spousePreferredName,
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
      isMarried,
      userHcmData,
      spouseHcmData,
      preferredName,
      spousePreferredName,
    ],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
