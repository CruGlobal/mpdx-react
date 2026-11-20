import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import { getHasSpouse } from './helpers/getHasSpouse';
import { getCompletionPercentage } from './stepCompletion';
import { NsoMpdQuestionnaireStep, useSteps } from './useSteps';

export type NewStaffQuestionnaire =
  NewStaffQuestionnaireQuery['newStaffQuestionnaire'];

export type NsoMpdQuestionnaireType = {
  steps: NsoMpdQuestionnaireStep[];
  currentStep: NsoMpdQuestionnaireStep;
  currentIndex: number;
  isLastStep: boolean;
  percentComplete: number;
  handleStepChange: (step: NsoMpdQuestionnaireStepEnum) => void;
  handleContinue: () => void;
  handleBack: () => void;
  questionnaire: NewStaffQuestionnaire | null;
  /** Whether the questionnaire belongs to a married staff member (has a spouse to collect info for). */
  hasSpouse: boolean;
  /** A submitted questionnaire can be read but never changed. */
  readOnly: boolean;
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

  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  const accountListId = useAccountListId();

  const { data: questionnaireData, loading } = useNewStaffQuestionnaireQuery({
    variables: { accountListId },
  });
  const questionnaire = questionnaireData?.newStaffQuestionnaire ?? null;
  const readOnly = questionnaire?.completed ?? false;

  // A submitted questionnaire opens on its Summary; the step pages stay reachable from there
  useEffect(() => {
    if (readOnly) {
      setCurrentIndex(
        steps.findIndex(
          (step) => step.step === NsoMpdQuestionnaireStepEnum.Summary,
        ),
      );
    }
  }, [readOnly, steps]);

  const hasSpouse = getHasSpouse(questionnaire?.maritalStatus);

  const percentComplete = useMemo(
    () => getCompletionPercentage(questionnaire),
    [questionnaire],
  );

  const [updateNewStaffQuestionnaire] =
    useUpdateNewStaffQuestionnaireMutation();
  const { trackMutation, isMutating } = useTrackMutation();

  const [completeNewStaffQuestionnaire] =
    useCompleteNewStaffQuestionnaireMutation();

  // The API refuses changes to a submitted questionnaire, so don't send any
  const completeQuestionnaire = useCallback(async (): Promise<void> => {
    if (!accountListId || readOnly) {
      return;
    }
    await completeNewStaffQuestionnaire({
      variables: { input: { accountListId } },
    });
  }, [accountListId, readOnly, completeNewStaffQuestionnaire]);

  const saveField = useCallback(
    async (
      attributes: Partial<NewStaffQuestionnaireAttributesInput>,
    ): Promise<void> => {
      if (!accountListId || readOnly) {
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
    [accountListId, readOnly, updateNewStaffQuestionnaire, trackMutation],
  );

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

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const contextValue = useMemo(
    (): NsoMpdQuestionnaireType => ({
      steps,
      currentStep,
      currentIndex,
      isLastStep,
      percentComplete,
      handleStepChange,
      handleContinue,
      handleBack,
      questionnaire,
      hasSpouse,
      readOnly,
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
      percentComplete,
      handleStepChange,
      handleContinue,
      handleBack,
      questionnaire,
      hasSpouse,
      readOnly,
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
