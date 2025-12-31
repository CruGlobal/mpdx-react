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
import { Box, CircularProgress } from '@mui/material';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from 'src/components/Reports/Shared/HcmData/HCMData.generated';
import { useStepList } from 'src/hooks/useStepList';
import { Steps } from '../../../Shared/CalculationReports/StepsList/StepsList';
import {
  MinistryHousingAllowanceRequestQuery,
  MinistryHousingAllowanceRequestsQuery,
  useMinistryHousingAllowanceRequestQuery,
  useMinistryHousingAllowanceRequestsQuery,
  useUpdateMinistryHousingAllowanceRequestMutation,
} from '../../MinisterHousingAllowance.generated';
import { hasPopulatedValues } from './Helper/hasPopulatedValues';

export type HcmData = HcmDataQuery['hcm'][number];

export type ContextType = {
  steps: Steps[];
  currentIndex: number;
  percentComplete: number;
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

  //const requestId = requestsData?.ministryHousingAllowanceRequests.nodes[0]?.id;
  const requestId = '2018e74b-3bc7-4d19-9d72-089f60feb6d6';

  const { data: requestData, error: requestError } =
    useMinistryHousingAllowanceRequestQuery({
      variables: {
        ministryHousingAllowanceRequestId: requestId ?? '',
      },
      skip: !requestId,
    });

  const hasValues = hasPopulatedValues(
    requestData?.ministryHousingAllowanceRequest?.requestAttributes ?? null,
  );

  const [updateMutation] = useUpdateMinistryHousingAllowanceRequestMutation();

  const pageType = type;
  const {
    steps: initialSteps,
    handleNextStep,
    handlePreviousStep,
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

  const { data: hcmData } = useHcmDataQuery();

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

  const [hasCalcValues, setHasCalcValues] = useState(hasValues ? true : false);
  const [isPrint, setIsPrint] = useState(false);

  const contextValue = useMemo(
    () => ({
      steps,
      currentIndex,
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

  if (!requestsData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
