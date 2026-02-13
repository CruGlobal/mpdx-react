import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ApolloError } from '@apollo/client';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useStepList } from 'src/hooks/useStepList';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from '../../Shared/HcmData/HCMData.generated';
import {
  AdditionalSalaryRequestQuery,
  useAdditionalSalaryRequestQuery,
  useDeleteAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { SalaryInfoQuery, useSalaryInfoQuery } from '../SalaryInfo.generated';
import { useStaffAccountIdQuery } from '../StaffAccountId.generated';

export type AdditionalSalaryRequestType = {
  staffAccountId: string | null | undefined;
  staffAccountIdLoading: boolean;
  steps: Steps[];
  currentIndex: number;
  currentStep: AdditionalSalaryRequestSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  goToStep: (targetIndex: number) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  requestData?: AdditionalSalaryRequestQuery | null;
  loading: boolean;
  currentYear?: number;
  requestError?: ApolloError;
  pageType: PageEnum;
  setPageType: (pageType: PageEnum) => void;
  handleDeleteRequest: (id: string, isCancel: boolean) => Promise<void>;
  requestId?: string;
  user: HcmDataQuery['hcm'][0] | undefined;
  spouse: HcmDataQuery['hcm'][1] | undefined;
  salaryInfo: SalaryInfoQuery['salaryInfo'] | undefined;
  isInternational: boolean;
  traditional403bPercentage: number;
  roth403bPercentage: number;
  isMutating: boolean;
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
  isNewAsr: boolean;
  setIsNewAsr: React.Dispatch<React.SetStateAction<boolean>>;
};

const AdditionalSalaryRequestContext =
  createContext<AdditionalSalaryRequestType | null>(null);

export const useAdditionalSalaryRequest = (): AdditionalSalaryRequestType => {
  const context = useContext(AdditionalSalaryRequestContext);
  if (context === null) {
    throw new Error(
      'Could not find AdditionalSalaryRequestContext. Make sure that your component is inside <AdditionalSalaryRequestProvider>.',
    );
  }
  return context;
};

interface Props {
  requestId?: string;
  initialPageType?: PageEnum;
  children?: React.ReactNode;
}

const sections = Object.values(AdditionalSalaryRequestSectionEnum);

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  requestId,
  initialPageType,
  children,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const [pageType, setPageType] = useState<PageEnum>(
    initialPageType ?? PageEnum.New,
  );

  const [isNewAsr, setIsNewAsr] = useState(false);

  const {
    steps,
    handleNextStep: nextStep,
    handlePreviousStep: previousStep,
    resetSteps,
    goToStep,
    currentIndex,
  } = useStepList(FormEnum.AdditionalSalary, undefined, 0);

  const { data: hcmData } = useHcmDataQuery();

  const {
    data: requestData,
    error: requestError,
    loading,
  } = useAdditionalSalaryRequestQuery();

  const currentYear = useMemo(() => DateTime.now().year, []);
  const { data: salaryInfoData } = useSalaryInfoQuery({
    variables: { year: currentYear },
  });

  const { data: staffAccountIdData, loading: staffAccountIdLoading } =
    useStaffAccountIdQuery();

  const [deleteAdditionalSalaryRequest] =
    useDeleteAdditionalSalaryRequestMutation();

  const currentStep = sections[currentIndex];

  const handleNextStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const handlePreviousStep = useCallback(() => {
    previousStep();
  }, [previousStep]);

  const handleDeleteRequest = useCallback(
    async (id: string, isCancel: boolean) => {
      await deleteAdditionalSalaryRequest({
        variables: { id },
        refetchQueries: ['AdditionalSalaryRequest'],
        awaitRefetchQueries: true,
        onCompleted: () => {
          if (!isCancel) {
            resetSteps();
            setPageType(PageEnum.New);
            setIsNewAsr(true);
          }

          enqueueSnackbar(
            isCancel
              ? t('Additional Salary Request cancelled successfully.')
              : t('Additional Salary Request discarded successfully.'),
            {
              variant: 'success',
            },
          );
        },
      });
    },
    [deleteAdditionalSalaryRequest, enqueueSnackbar, resetSteps, t],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const { trackMutation, isMutating } = useTrackMutation();

  const [user, spouse] = hcmData?.hcm ?? [];
  const salaryInfo = salaryInfoData?.salaryInfo;
  const isInternational = user?.staffInfo?.isInternational ?? false;
  const taxDeferred =
    user?.fourOThreeB.currentTaxDeferredContributionPercentage ?? 0;
  const roth = user?.fourOThreeB.currentRothContributionPercentage ?? 0;
  const traditional403bPercentage = taxDeferred / 100;
  const roth403bPercentage = roth / 100;

  const staffAccountId = useMemo(
    () => staffAccountIdData?.user?.staffAccountId,
    [staffAccountIdData],
  );

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      staffAccountId,
      staffAccountIdLoading,
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      goToStep,
      isDrawerOpen,
      toggleDrawer,
      requestData,
      requestError,
      loading,
      currentYear,
      pageType,
      setPageType,
      handleDeleteRequest,
      requestId: requestData?.latestAdditionalSalaryRequest?.id ?? requestId,
      user,
      spouse,
      salaryInfo,
      isInternational,
      traditional403bPercentage,
      roth403bPercentage,
      isMutating,
      trackMutation,
      isNewAsr,
      setIsNewAsr,
    }),
    [
      staffAccountId,
      staffAccountIdLoading,
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      goToStep,
      isDrawerOpen,
      toggleDrawer,
      requestData,
      requestError,
      loading,
      currentYear,
      pageType,
      setPageType,
      handleDeleteRequest,
      requestId,
      user,
      spouse,
      salaryInfo,
      isInternational,
      traditional403bPercentage,
      roth403bPercentage,
      isMutating,
      trackMutation,
      isNewAsr,
      setIsNewAsr,
    ],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
