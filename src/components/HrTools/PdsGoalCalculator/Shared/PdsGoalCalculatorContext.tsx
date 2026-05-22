import { useRouter } from 'next/router';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import {
  DesignationSupportCalculationUpdateInput,
  DesignationSupportFormType,
} from 'src/graphql/types.generated';
import { useTrackMutation } from 'src/hooks/useTrackMutation';
import { safeProgressRatio } from '../../GoalCalculator/Shared/safeProgressRatio';
import {
  PdsGoalCalculationFieldsFragment,
  usePdsGoalCalculationQuery,
} from '../GoalsList/PdsGoalCalculations.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import {
  PdsSummaryData,
  usePdsSummaryData,
} from '../calculations/usePdsSummaryData';
import { HcmUserQuery, useHcmUserQuery } from './HCM.generated';
import {
  PdsGoalCalculatorStep,
  PdsGoalCalculatorSteps,
  useSteps,
} from './useSteps';

export type PdsGoalCalculatorType = {
  steps: PdsGoalCalculatorSteps;
  currentStep: PdsGoalCalculatorStep;

  calculation?: PdsGoalCalculationFieldsFragment;
  calculationLoading: boolean;
  hcmUser?: HcmUserQuery['hcm'][number];
  summaryData: PdsSummaryData | null;
  percentComplete: number;

  /** Whether any mutations are currently in progress */
  isMutating: boolean;
  /** Whether a save mutation tagged with the given field name is in flight */
  isFieldSaving: (
    fieldName: keyof DesignationSupportCalculationUpdateInput,
  ) => boolean;
  /** Call with the mutation promise to track the start and end of mutations */
  trackMutation: <T>(mutation: Promise<T>) => Promise<T>;
  /**
   * Like trackMutation, but also marks the listed fields as saving while the
   * mutation is in flight so per-field disable checks can scope to the field
   * being saved instead of any save in the calculator.
   */
  trackFieldMutation: <T>(
    mutation: Promise<T>,
    fields: Array<keyof DesignationSupportCalculationUpdateInput>,
  ) => Promise<T>;

  rightPanelContent: React.ReactNode;
  setRightPanelContent: (content: React.ReactNode) => void;
  closeRightPanel: () => void;

  stepIndex: number;
  isDrawerOpen: boolean;
  handleStepChange: (stepId: PdsGoalCalculatorStepEnum) => void;
  handleContinue: () => void;
  handlePreviousStep: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

const PdsGoalCalculatorContext = createContext<PdsGoalCalculatorType | null>(
  null,
);

export const usePdsGoalCalculator = (): PdsGoalCalculatorType => {
  const context = React.useContext(PdsGoalCalculatorContext);
  if (context === null) {
    throw new Error(
      'Could not find PdsGoalCalculatorContext. Make sure that your component is inside <PdsGoalCalculatorProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const PdsGoalCalculatorProvider: React.FC<Props> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const router = useRouter();
  const pdsGoalId = (router.query.pdsGoalId as string) ?? '';

  const { data: calculationData, loading: calculationLoading } =
    usePdsGoalCalculationQuery({
      variables: { id: pdsGoalId },
      skip: !pdsGoalId,
    });
  const calculation = calculationData?.designationSupportCalculation;

  const { data: hcmData } = useHcmUserQuery();
  const hcmUser = hcmData?.hcm[0];

  const { data: summaryData } = usePdsSummaryData(calculation, hcmUser);

  // Track the user's place by step enum, not numeric index, so that a change
  // to the steps array (e.g. formType switch Detailed → Simple, dropping the
  // ReimbursableExpenses step) preserves their step when it still exists.
  // When it doesn't exist, the effect below reconciles activeStep to the first
  // step and notifies the user.
  const [activeStep, setActiveStep] = useState<PdsGoalCalculatorStepEnum>(
    PdsGoalCalculatorStepEnum.Setup,
  );

  const steps = useSteps(
    calculation?.formType ?? DesignationSupportFormType.Detailed,
  );
  const [rightPanelContent, setRightPanelContent] =
    useState<React.ReactNode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const { trackMutation, isMutating } = useTrackMutation();

  const [savingFieldCounts, setSavingFieldCounts] = useState<
    Record<string, number>
  >({});

  const isFieldSaving = useCallback(
    (fieldName: keyof DesignationSupportCalculationUpdateInput) =>
      (savingFieldCounts[fieldName] ?? 0) > 0,
    [savingFieldCounts],
  );

  const trackFieldMutation = useCallback(
    <T,>(
      mutation: Promise<T>,
      fields: Array<keyof DesignationSupportCalculationUpdateInput>,
    ): Promise<T> => {
      setSavingFieldCounts((prev) => {
        const next = { ...prev };
        for (const field of fields) {
          next[field] = (next[field] ?? 0) + 1;
        }
        return next;
      });
      return trackMutation(
        mutation.finally(() => {
          setSavingFieldCounts((prev) => {
            const next = { ...prev };
            for (const field of fields) {
              const remaining = (next[field] ?? 0) - 1;
              if (remaining <= 0) {
                delete next[field];
              } else {
                next[field] = remaining;
              }
            }
            return next;
          });
        }),
      );
    },
    [trackMutation],
  );

  useEffect(() => {
    if (steps.some((s) => s.step === activeStep)) {
      return;
    }
    setActiveStep(steps[0]?.step ?? PdsGoalCalculatorStepEnum.Setup);
    enqueueSnackbar(
      t('Returned to Setup because the current step is no longer available.'),
      { variant: 'info' },
    );
  }, [steps, activeStep, enqueueSnackbar, t]);

  const stepIndex = useMemo(() => {
    const idx = steps.findIndex((s) => s.step === activeStep);
    return idx === -1 ? 0 : idx;
  }, [steps, activeStep]);

  const currentStep = steps[stepIndex];

  const percentComplete = Math.round(
    safeProgressRatio(stepIndex + 1, steps.length) * 100,
  );

  const handleStepChange = useCallback(
    (newStep: PdsGoalCalculatorStepEnum) => {
      if (steps.some((step) => step.step === newStep)) {
        setActiveStep(newStep);
      } else {
        enqueueSnackbar(t('The selected step does not exist.'), {
          variant: 'error',
        });
      }
    },
    [steps, enqueueSnackbar, t],
  );

  const handleContinue = useCallback(() => {
    if (stepIndex < steps.length - 1) {
      setActiveStep(steps[stepIndex + 1].step);
    }
  }, [stepIndex, steps]);

  const handlePreviousStep = useCallback(() => {
    if (stepIndex > 0) {
      setActiveStep(steps[stepIndex - 1].step);
    }
  }, [stepIndex, steps]);

  const closeRightPanel = useCallback(() => {
    setRightPanelContent(null);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    (): PdsGoalCalculatorType => ({
      steps,
      currentStep,
      stepIndex,
      calculation,
      calculationLoading,
      summaryData,
      percentComplete,
      isMutating,
      isFieldSaving,
      trackMutation,
      trackFieldMutation,
      hcmUser,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      handlePreviousStep,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setDrawerOpen: setIsDrawerOpen,
    }),
    [
      steps,
      currentStep,
      stepIndex,
      calculation,
      calculationLoading,
      summaryData,
      percentComplete,
      isMutating,
      isFieldSaving,
      trackMutation,
      trackFieldMutation,
      hcmUser,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      handlePreviousStep,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setIsDrawerOpen,
    ],
  );

  return (
    <PdsGoalCalculatorContext.Provider value={contextValue}>
      {children}
    </PdsGoalCalculatorContext.Provider>
  );
};
