import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { PdsGoalCalculatorStep, useSteps } from './useSteps';

export type PdsGoalCalculatorType = {
  steps: PdsGoalCalculatorStep[];
  currentStep: PdsGoalCalculatorStep;

  rightPanelContent: React.ReactNode;
  setRightPanelContent: (content: React.ReactNode) => void;
  closeRightPanel: () => void;

  isDrawerOpen: boolean;
  handleStepChange: (stepId: PdsGoalCalculatorStepEnum) => void;
  handleContinue: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
};

const PdsGoalCalculatorContext = createContext<PdsGoalCalculatorType | null>(null);

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

  const steps = useSteps();
  const [stepIndex, setStepIndex] = useState(0);
  const [rightPanelContent, setRightPanelContent] =
    useState<React.ReactNode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const currentStep = steps[stepIndex];

  const handleStepChange = useCallback(
    (newStep: PdsGoalCalculatorStepEnum) => {
      const newIndex = steps.findIndex((step) => step.step === newStep);
      if (newIndex !== -1) {
        setStepIndex(newIndex);
      } else {
        enqueueSnackbar(t('The selected step does not exist.'), {
          variant: 'error',
        });
      }
    },
    [steps, enqueueSnackbar, t],
  );

  const handleContinue = useCallback(() => {
    setStepIndex((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      }
      enqueueSnackbar(
        t('You have reached the end of the PDS goal calculator.'),
        { variant: 'info' },
      );
      return prev;
    });
  }, [steps, enqueueSnackbar, t]);

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
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
      setRightPanelContent,
      closeRightPanel,
      toggleDrawer,
      setDrawerOpen: setIsDrawerOpen,
    }),
    [
      steps,
      currentStep,
      rightPanelContent,
      isDrawerOpen,
      handleStepChange,
      handleContinue,
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
