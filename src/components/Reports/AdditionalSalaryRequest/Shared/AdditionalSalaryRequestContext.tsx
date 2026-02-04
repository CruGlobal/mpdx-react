import { useRouter } from 'next/router';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { DateTime } from 'luxon';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useAccountListId } from 'src/hooks/useAccountListId';
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
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  requestData?: AdditionalSalaryRequestQuery | null;
  loading: boolean;
  currentYear?: number;

  requestError?: ApolloError;
  pageType: PageEnum | undefined;
  handleDeleteRequest: (id: string, isCancel: boolean) => Promise<void>;
  requestId?: string;
  user: HcmDataQuery['hcm'][0] | undefined;
  spouse: HcmDataQuery['hcm'][1] | undefined;
  salaryInfo: SalaryInfoQuery['salaryInfo'] | undefined;
  isInternational: boolean;
  isMutating: boolean;
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
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
  requestId?: string;
  children?: React.ReactNode;
}

const sections = Object.values(AdditionalSalaryRequestSectionEnum);

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  requestId,
  children,
}) => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();
  const router = useRouter();
  const { mode } = router.query;

  const pageType = useMemo(() => {
    switch (mode) {
      case 'new':
        return PageEnum.New;
      case 'edit':
        return PageEnum.Edit;
      case 'view':
        return PageEnum.View;
      default:
        return undefined;
    }
  }, [mode]);

  const {
    steps,
    handleNextStep: nextStep,
    handlePreviousStep: previousStep,
    currentIndex,
  } = useStepList(FormEnum.AdditionalSalary);

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
        update: (cache) => {
          cache.evict({
            id: cache.identify({ __typename: 'AdditionalSalaryRequest', id }),
          });
          cache.gc();
        },
        onCompleted: () => {
          if (!isCancel) {
            router.push(
              `/accountLists/${accountListId}/reports/additionalSalaryRequest`,
            );
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
    [deleteAdditionalSalaryRequest, enqueueSnackbar, accountListId, router, t],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const { trackMutation, isMutating } = useTrackMutation();

  const [user, spouse] = hcmData?.hcm ?? [];
  const salaryInfo = salaryInfoData?.salaryInfo;
  const isInternational = user?.staffInfo?.isInternational ?? false;

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
      isDrawerOpen,
      toggleDrawer,
      requestData,
      requestError,
      loading,
      currentYear,
      pageType,
      handleDeleteRequest,
      requestId,
      user,
      spouse,
      salaryInfo,
      isInternational,
      isMutating,
      trackMutation,
    }),
    [
      staffAccountId,
      staffAccountIdLoading,
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      requestData,
      requestError,
      loading,
      currentYear,
      pageType,
      handleDeleteRequest,
      requestId,
      user,
      spouse,
      salaryInfo,
      isInternational,
      isMutating,
      trackMutation,
    ],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
