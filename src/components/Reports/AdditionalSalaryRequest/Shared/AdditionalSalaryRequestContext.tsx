import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ApolloError } from '@apollo/client';
import { DateTime } from 'luxon';
import {
  FormEnum,
  PageEnum,
} from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import { useStepList } from 'src/hooks/useStepList';
import { Steps } from '../../Shared/CalculationReports/StepsList/StepsList';
import {
  HcmDataQuery,
  useHcmDataQuery,
} from '../../Shared/HcmData/HCMData.generated';
import {
  AdditionalSalaryRequestQuery,
  AdditionalSalaryRequestsQuery,
  SalaryInfoQuery,
  useAdditionalSalaryRequestQuery,
  useAdditionalSalaryRequestsQuery,
  useDeleteAdditionalSalaryRequestMutation,
  useSalaryInfoQuery,
} from '../AdditionalSalaryRequest.generated';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { useStaffAccountIdQuery } from '../StaffAccountId.generated';

export type HcmData = HcmDataQuery['hcm'][number];

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
  salaryInfoData?: SalaryInfoQuery['salaryInfo'] | null;
  currentYear?: number;

  requestsError?: ApolloError;
  pageType: PageEnum | undefined;
  handleDeleteRequest: (id: string) => Promise<void>;
  requestId?: string;
  user?: HcmData;
  spouse?: HcmData | null;
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

  const { data: requestData } = useAdditionalSalaryRequestQuery({
    variables: { requestId: requestId || '' },
    skip: !requestId,
  });

  const currentYear = DateTime.now().year;
  const { data: salaryInfoData } = useSalaryInfoQuery({
    variables: { year: currentYear },
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

  const [mutationCount, setMutationCount] = useState(0);
  const isMutating = mutationCount > 0;

  const trackMutation = useCallback(
    async <T,>(mutation: Promise<T>): Promise<T> => {
      setMutationCount((prev) => prev + 1);
      return mutation.finally(() => {
        setMutationCount((prev) => Math.max(0, prev - 1));
      });
    },
    [],
  );

  const [user, setUser] = useState<HcmData>();
  const [spouse, setSpouse] = useState<HcmData | null>(null);

  useEffect(() => {
    if (!hcmData?.hcm?.length) {
      setUser(undefined);
      setSpouse(null);
      return;
    }
    const [user, spouse] = hcmData.hcm;
    setUser(user);
    setSpouse(spouse ?? null);
  }, [hcmData]);

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
      salaryInfoData: salaryInfoData?.salaryInfo,
      currentYear,
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
      salaryInfoData,
      currentYear,
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
