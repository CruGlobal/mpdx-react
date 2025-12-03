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
import { ApolloError } from '@apollo/client';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from 'src/components/Reports/Shared/HcmData/HCMData.generated';
import { MaritalStatusEnum, MhaStatusEnum } from 'src/graphql/types.generated';
import { useStepList } from 'src/hooks/useStepList';
import { Steps } from '../../../Shared/CalculationReports/StepsList/StepsList';
import {
  MinistryHousingAllowanceRequestQuery,
  MinistryHousingAllowanceRequestsQuery,
  useMinistryHousingAllowanceRequestQuery,
  useMinistryHousingAllowanceRequestsQuery,
  useUpdateMinistryHousingAllowanceRequestMutation,
} from '../../MinisterHousingAllowance.generated';
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

  requestData?:
    | MinistryHousingAllowanceRequestQuery['ministryHousingAllowanceRequest']
    | null;
  requestError?: ApolloError;

  requestsData?:
    | MinistryHousingAllowanceRequestsQuery['ministryHousingAllowanceRequests']['nodes']
    | null;
  requestsError?: ApolloError;
  requestId?: string;

  updateMutation: ReturnType<
    typeof useUpdateMinistryHousingAllowanceRequestMutation
  >[0];
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

export const MinisterHousingAllowanceProvider: React.FC<Props> = ({
  type,
  children,
}) => {
  const { data: requestsData, error: requestsError } =
    useMinistryHousingAllowanceRequestsQuery();

  //const requestId = requestsData?.ministryHousingAllowanceRequests.nodes[1]?.id;
  const requestId = 'c1a68821-5fb6-4e5e-b308-9263539af9d8';

  const { data: requestData, error: requestError } =
    useMinistryHousingAllowanceRequestQuery({
      variables: {
        ministryHousingAllowanceRequestId: requestId ?? '',
      },
      skip: !requestId,
    });

  const [updateMutation] = useUpdateMinistryHousingAllowanceRequestMutation();

  const pageType = type;
  const initialSteps = useStepList(FormEnum.MHA, type);

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

  const totalSteps = steps.length;

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

  // Set hcm email & phone to request contact info once
  const [hasUpdatedContactInfo, setHasUpdatedContactInfo] = useState(false);
  const canUpdate =
    requestData?.ministryHousingAllowanceRequest?.status ===
      MhaStatusEnum.InProgress ||
    requestData?.ministryHousingAllowanceRequest?.status ===
      MhaStatusEnum.ActionRequired;

  useEffect(() => {
    if (hasUpdatedContactInfo || !userHcmData || !requestId || !canUpdate) {
      return;
    }

    updateMutation({
      variables: {
        input: {
          requestId: requestId ?? '',
          requestAttributes: {
            phoneNumber: userHcmData.staffInfo.primaryPhoneNumber ?? '',
            emailAddress: userHcmData.staffInfo.emailAddress ?? '',
          },
        },
      },
    }).finally(() => {
      setHasUpdatedContactInfo(true);
    });
  }, [
    hasUpdatedContactInfo,
    userHcmData,
    requestId,
    canUpdate,
    updateMutation,
  ]);

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
      requestData: requestData?.ministryHousingAllowanceRequest ?? null,
      requestError,
      requestsData:
        requestsData?.ministryHousingAllowanceRequests.nodes ?? null,
      requestsError,
      requestId,
      updateMutation,
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
      requestData,
      requestError,
      requestsData,
      requestsError,
      requestId,
      updateMutation,
    ],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
