import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from 'src/components/Reports/Shared/HcmData/HCMData.generated';
import { MaritalStatusEnum } from 'src/graphql/types.generated';
import { useStepList } from 'src/hooks/useStepList';
import { Steps } from '../../../Shared/CalculationReports/StepsList/StepsList';
import { StepsEnum } from '../sharedTypes';

export type HcmData = HcmDataQuery['hcm'][number];

export type ContextType = {
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;
  currentStep: StepsEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  pageType: PageEnum | undefined;
  hasCalcValues: boolean;
  setHasCalcValues: Dispatch<SetStateAction<boolean>>;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
  isPrint: boolean;
  setIsPrint: Dispatch<SetStateAction<boolean>>;
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  isMarried: boolean;
  userHcmData?: HcmData;
  spouseHcmData?: HcmData | null;
  preferredName: string;
  spousePreferredName: string;
};

export const MinisterHousingAllowanceContext =
  createContext<ContextType | null>(null);

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

const objects = Object.values(StepsEnum);

export const MinisterHousingAllowanceProvider: React.FC<Props> = ({
  type,
  children,
}) => {
  const pageType = type;
  const {
    steps: initialSteps,
    nextStep,
    previousStep,
    currentIndex,
    percentComplete,
  } = useStepList(FormEnum.MHA, type);

  const [isComplete, setIsComplete] = useState(false);

  const steps = useMemo(() => {
    if (!isComplete) {
      return initialSteps;
    }

    return initialSteps.map((step, index, arr) => ({
      ...step,
      complete: true,
      current: index === arr.length - 1,
    }));
  }, [initialSteps, isComplete]);

  const { data: hcmData } = useHcmDataQuery({
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const actionRequired = pageType === PageEnum.Edit;
  const [hasCalcValues, setHasCalcValues] = useState(
    actionRequired ? true : false,
  );
  const [isPrint, setIsPrint] = useState(false);

  const [currentStep, setCurrentStep] = useState(StepsEnum.AboutForm);

  const handleNextStep = useCallback(() => {
    const next = objects[currentIndex + 1];
    nextStep();

    setCurrentStep(next);
  }, [currentIndex, objects, nextStep]);

  const handlePreviousStep = useCallback(() => {
    const next = objects[currentIndex - 1];
    previousStep();

    setCurrentStep(next);
  }, [currentIndex, objects, previousStep]);

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
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
      isMarried,
      userHcmData,
      spouseHcmData,
      preferredName,
      spousePreferredName,
      isPrint,
      setIsPrint,
      setIsComplete,
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
      isDrawerOpen,
      toggleDrawer,
      setIsDrawerOpen,
      isMarried,
      userHcmData,
      spouseHcmData,
      preferredName,
      spousePreferredName,
      isPrint,
      setIsPrint,
      setIsComplete,
    ],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
