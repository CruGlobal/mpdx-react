import React, { createContext, useCallback, useMemo, useState } from 'react';
import { NewStaffQuestionnaireAttributesInput } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { useCompleteNewStaffQuestionnaireMutation } from './CompleteNewStaffQuestionnaire.generated';
import {
  NewStaffQuestionnaireQuery,
  useNewStaffQuestionnaireQuery,
} from './NewStaffQuestionnaire.generated';
import { useUpdateNewStaffQuestionnaireMutation } from './UpdateNewStaffQuestionnaire.generated';
import { NsoMpdQuestionnaireStep, useSteps } from './useSteps';

export type NewStaffQuestionnaire =
  NewStaffQuestionnaireQuery['newStaffQuestionnaire'];

export type NsoMpdQuestionnaireType = {
  steps: NsoMpdQuestionnaireStep[];
  currentStep: NsoMpdQuestionnaireStep;
  currentIndex: number;
  isLastStep: boolean;
  isDrawerOpen: boolean;
  handleStepChange: (step: NsoMpdQuestionnaireStepEnum) => void;
  handleContinue: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  questionnaire: NewStaffQuestionnaire | null;
  loading: boolean;
  isMutating: boolean;
  saveField: (
    attributes: Partial<NewStaffQuestionnaireAttributesInput>,
  ) => Promise<void>;
  completeQuestionnaire: () => Promise<void>;
};

const NsoMpdQuestionnaireContext =
  createContext<NsoMpdQuestionnaireType | null>(null);

export const useNsoMpdQuestionnaire = (): NsoMpdQuestionnaireType => {
  const context = React.useContext(NsoMpdQuestionnaireContext);
  if (context === null) {
    throw new Error(
      'Could not find NsoMpdQuestionnaireContext. Make sure that your component is inside <NsoMpdQuestionnaireProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const NsoMpdQuestionnaireProvider: React.FC<Props> = ({ children }) => {
  const steps = useSteps();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  const accountListId = useAccountListId();

  const { data: questionnaireData, loading } = useNewStaffQuestionnaireQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });
  const questionnaire = questionnaireData?.newStaffQuestionnaire ?? null;

  const [updateNewStaffQuestionnaire] =
    useUpdateNewStaffQuestionnaireMutation();
  const { trackMutation, isMutating } = useTrackMutation();

  const [completeNewStaffQuestionnaire] =
    useCompleteNewStaffQuestionnaireMutation();

  const completeQuestionnaire = useCallback(async (): Promise<void> => {
    if (!accountListId) {
      return;
    }
    await completeNewStaffQuestionnaire({
      variables: { input: { accountListId } },
    });
  }, [accountListId, completeNewStaffQuestionnaire]);

  const saveField = useCallback(
    async (
      attributes: Partial<NewStaffQuestionnaireAttributesInput>,
    ): Promise<void> => {
      if (!accountListId) {
        return;
      }
      await trackMutation(
        updateNewStaffQuestionnaire({
          variables: {
            input: { accountListId, attributes },
          },
        }),
      );
    },
    [accountListId, updateNewStaffQuestionnaire, trackMutation],
  );

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const setDrawerOpen = useCallback((open: boolean) => {
    setIsDrawerOpen(open);
  }, []);

  const handleStepChange = useCallback(
    (newStep: NsoMpdQuestionnaireStepEnum) => {
      const newIndex = steps.findIndex((step) => step.step === newStep);
      if (newIndex !== -1) {
        setCurrentIndex(newIndex);
      }
    },
    [steps],
  );

  const handleContinue = useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [steps, currentIndex]);

  const contextValue = useMemo(
    (): NsoMpdQuestionnaireType => ({
      steps,
      currentStep,
      currentIndex,
      isLastStep,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      toggleDrawer,
      setDrawerOpen,
      questionnaire,
      loading,
      isMutating,
      saveField,
      completeQuestionnaire,
    }),
    [
      steps,
      currentStep,
      currentIndex,
      isLastStep,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      toggleDrawer,
      setDrawerOpen,
      questionnaire,
      loading,
      isMutating,
      saveField,
      completeQuestionnaire,
    ],
  );

  return (
    <NsoMpdQuestionnaireContext.Provider value={contextValue}>
      {children}
    </NsoMpdQuestionnaireContext.Provider>
  );
};
