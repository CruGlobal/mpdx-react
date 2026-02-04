import { useRouter } from 'next/router';
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
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from 'src/components/Reports/Shared/HcmData/HCMData.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useStepList } from 'src/hooks/useStepList';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import { Steps } from '../../../Shared/CalculationReports/StepsList/StepsList';
import {
  MinistryHousingAllowanceRequestQuery,
  useDeleteMinistryHousingAllowanceRequestMutation,
  useMinistryHousingAllowanceRequestQuery,
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
  setIsComplete: Dispatch<SetStateAction<boolean>>;
  isMarried: boolean;
  userHcmData?: HcmData;
  spouseHcmData?: HcmData | null;
  preferredName: string;
  spousePreferredName: string;
  userEligibleForMHA: boolean;
  handleDiscard: () => Promise<void>;

  requestData?:
    | MinistryHousingAllowanceRequestQuery['ministryHousingAllowanceRequest']
    | null;
  requestError?: ApolloError;
  loading: boolean;
  requestId?: string;

  deleteRequestMutation: ReturnType<
    typeof useDeleteMinistryHousingAllowanceRequestMutation
  >[0];
  updateMutation: ReturnType<
    typeof useUpdateMinistryHousingAllowanceRequestMutation
  >[0];

  isMutating: boolean;
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
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
  requestId?: string;
  type?: PageEnum;
  children?: React.ReactNode;
}

export const MinisterHousingAllowanceProvider: React.FC<Props> = ({
  requestId,
  type,
  children,
}) => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: requestData,
    error: requestError,
    loading,
  } = useMinistryHousingAllowanceRequestQuery({
    variables: {
      ministryHousingAllowanceRequestId: requestId ?? '',
    },
    skip: !requestId,
  });

  const hasValues = hasPopulatedValues(
    requestData?.ministryHousingAllowanceRequest?.requestAttributes ?? null,
  );

  const [deleteRequestMutation] =
    useDeleteMinistryHousingAllowanceRequestMutation({
      refetchQueries: ['MinistryHousingAllowanceRequests'],
      awaitRefetchQueries: true,
    });

  const handleDiscard = async () => {
    await deleteRequestMutation({
      variables: {
        input: {
          requestId: requestId ?? '',
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Request discarded successfully.'), {
          variant: 'success',
        });
        router.push(`/accountLists/${accountListId}/reports/housingAllowance`);
      },
    });
  };

  const [updateMutation] = useUpdateMinistryHousingAllowanceRequestMutation();
  const { trackMutation, isMutating } = useTrackMutation();

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

  const userEligibleForMHA = useMemo(
    () => userHcmData?.mhaEit?.mhaEligibility ?? false,
    [userHcmData],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const [hasCalcValues, setHasCalcValues] = useState(hasValues);
  useEffect(() => {
    setHasCalcValues(hasValues);
  }, [hasValues]);

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
      userEligibleForMHA,
      handleDiscard,
      setIsComplete,
      requestData: requestData?.ministryHousingAllowanceRequest ?? null,
      requestError,
      loading,
      requestId,
      deleteRequestMutation,
      updateMutation,
      isMutating,
      trackMutation,
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
      userEligibleForMHA,
      handleDiscard,
      requestData,
      requestError,
      loading,
      requestId,
      deleteRequestMutation,
      updateMutation,
      isMutating,
      trackMutation,
    ],
  );

  return (
    <MinisterHousingAllowanceContext.Provider value={contextValue}>
      {children}
    </MinisterHousingAllowanceContext.Provider>
  );
};
