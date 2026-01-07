import { useRouter } from 'next/router';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { ApolloError } from '@apollo/client';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useStepList } from 'src/hooks/useStepList';
import { FormEnum } from '../../Shared/CalculationReports/Shared/sharedTypes';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import { useHcmDataQuery } from '../../Shared/HcmData/HCMData.generated';
import {
  AdditionalSalaryRequestsQuery,
  useAdditionalSalaryRequestsQuery,
  useDeleteAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  steps: Steps[];
  currentIndex: number;
  currentStep: AdditionalSalaryRequestSectionEnum;
  handleNextStep: () => void;
  handlePreviousStep: () => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  preferredName: string;
  spousePreferredName: string;
  requestsData?:
    | AdditionalSalaryRequestsQuery['additionalSalaryRequests']['nodes']
    | null;
  requestsError?: ApolloError;
  pageType: PageEnum | undefined;
  handleDeleteRequest: (id: string) => Promise<void>;
  requestId?: string;
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

  const { steps, nextStep, previousStep, currentIndex } = useStepList(
    FormEnum.AdditionalSalary,
  );

  const { data: hcmData } = useHcmDataQuery();

  const { data: requestsData, error: requestsError } =
    useAdditionalSalaryRequestsQuery();

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
    async (id: string) => {
      await deleteAdditionalSalaryRequest({
        variables: { id },
        refetchQueries: ['AdditionalSalaryRequests'],
      });
    },
    [deleteAdditionalSalaryRequest],
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const [user, spouse] = hcmData?.hcm ?? [];

  const preferredName = useMemo(
    () => user?.staffInfo?.preferredName || '',
    [user],
  );

  const spousePreferredName = useMemo(
    () => spouse?.staffInfo?.preferredName || '',
    [spouse],
  );

  const contextValue = useMemo<AdditionalSalaryRequestType>(
    () => ({
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      preferredName,
      spousePreferredName,
      requestsData: requestsData?.additionalSalaryRequests?.nodes,
      requestsError,
      pageType,
      handleDeleteRequest,
      requestId,
    }),
    [
      steps,
      currentIndex,
      currentStep,
      handleNextStep,
      handlePreviousStep,
      isDrawerOpen,
      toggleDrawer,
      preferredName,
      spousePreferredName,
      requestsData,
      requestsError,
      pageType,
      handleDeleteRequest,
      requestId,
    ],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
