import { useRouter } from 'next/router';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
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
  AdditionalSalaryRequestsQuery,
  useAdditionalSalaryRequestQuery,
  useAdditionalSalaryRequestsQuery,
  useDeleteAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { useStaffAccountIdQuery } from '../StaffAccountId.generated';

export type AdditionalSalaryRequestType = {
  staffAccountId: string | null | undefined;
  steps: Steps[];
  currentIndex: number;
  currentStep: AdditionalSalaryRequestSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  requestsData?:
    | AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes']
    | null;
  requestData?: AdditionalSalaryRequestQuery | null;
  loading: boolean;

  requestsError?: ApolloError;
  pageType: PageEnum | undefined;
  handleDeleteRequest: (id: string, isCancel: boolean) => Promise<void>;
  requestId?: string;
  user: HcmDataQuery['hcm'][0] | undefined;
  spouse: HcmDataQuery['hcm'][1] | undefined;
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

  const { data: requestsData, error: requestsError } =
    useAdditionalSalaryRequestsQuery();

  const { data: requestData, loading } = useAdditionalSalaryRequestQuery({
    variables: { requestId: requestId || '' },
    skip: !requestId,
  });

  const { data: staffAccountIdData } = useStaffAccountIdQuery();

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
          enqueueSnackbar(
            t(`Additional Salary Request {{action}} successfully.`, {
              action: isCancel ? 'cancelled' : 'discarded',
            }),
            {
              variant: 'success',
            },
          );

          if (!isCancel) {
            router.push(
              `/accountLists/${accountListId}/reports/additionalSalaryRequest`,
            );
          }
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

  const staffAccountId = useMemo(
    () => staffAccountIdData?.user?.staffAccountId,
    [staffAccountIdData],
  );

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      staffAccountId,
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      requestsData: requestsData?.additionalSalaryRequests?.nodes,
      requestsError,
      requestData,
      loading,
      pageType,
      handleDeleteRequest,
      requestId,
      user,
      spouse,
      isMutating,
      trackMutation,
    }),
    [
      staffAccountId,
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      requestsData,
      requestsError,
      requestData,
      loading,
      pageType,
      handleDeleteRequest,
      requestId,
      user,
      spouse,
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
