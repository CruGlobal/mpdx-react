import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DesignationSupportFormType } from 'src/graphql/types.generated';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { usePdsGoalCalculator } from './PdsGoalCalculatorContext';
import { useSteps } from './useSteps';
import type { PdsGoalCalculatorStep, PdsGoalCalculatorSteps } from './useSteps';

// SWC marks named ESM exports as non-configurable, so jest.spyOn cannot
// redefine `useSteps`. Mock the module with a jest.fn that delegates to the
// real implementation by default — reconcile tests scope their overrides via
// mockReturnValue + an afterEach restore.
jest.mock('./useSteps', () => {
  const actual = jest.requireActual<typeof import('./useSteps')>('./useSteps');
  return {
    __esModule: true,
    ...actual,
    useSteps: jest.fn(actual.useSteps),
  };
});

const mockedUseSteps = useSteps as jest.MockedFunction<typeof useSteps>;

const stub = (step: PdsGoalCalculatorStepEnum): PdsGoalCalculatorStep => ({
  step,
  title: step,
  icon: <SettingsIcon />,
});

const detailedSteps: PdsGoalCalculatorSteps = [
  stub(PdsGoalCalculatorStepEnum.Setup),
  stub(PdsGoalCalculatorStepEnum.ReimbursableExpenses),
  stub(PdsGoalCalculatorStepEnum.SupportItem),
  stub(PdsGoalCalculatorStepEnum.SummaryReport),
];

const simpleSteps: PdsGoalCalculatorSteps = [
  stub(PdsGoalCalculatorStepEnum.Setup),
  stub(PdsGoalCalculatorStepEnum.SupportItem),
  stub(PdsGoalCalculatorStepEnum.SummaryReport),
];

const minimalSteps: PdsGoalCalculatorSteps = [
  stub(PdsGoalCalculatorStepEnum.Setup),
  stub(PdsGoalCalculatorStepEnum.SummaryReport),
];

const renderUsePdsGoalCalculator = () =>
  renderHook(() => usePdsGoalCalculator(), {
    wrapper: ({ children }) => (
      <PdsGoalCalculatorTestWrapper>{children}</PdsGoalCalculatorTestWrapper>
    ),
  });

const StepProbe: React.FC = () => {
  const { currentStep, stepIndex, steps, handleStepChange } =
    usePdsGoalCalculator();
  return (
    <div>
      <div data-testid="current-step">{currentStep.step}</div>
      <div data-testid="step-index">{stepIndex}</div>
      <div data-testid="step-count">{steps.length}</div>
      <button
        type="button"
        onClick={() =>
          handleStepChange(PdsGoalCalculatorStepEnum.ReimbursableExpenses)
        }
      >
        go to reimbursable
      </button>
      <button
        type="button"
        onClick={() =>
          handleStepChange(PdsGoalCalculatorStepEnum.SummaryReport)
        }
      >
        go to summary
      </button>
      <button
        type="button"
        onClick={() => handleStepChange(PdsGoalCalculatorStepEnum.SupportItem)}
      >
        go to support item
      </button>
    </div>
  );
};

describe('PdsGoalCalculatorContext', () => {
  it('provides steps and current step', async () => {
    const { result } = renderUsePdsGoalCalculator();

    await waitFor(() => expect(result.current.steps).toHaveLength(4));
    expect(result.current.currentStep.step).toBe('setup');
  });

  it('passes calculation.formType through to useSteps (Simple → 3 steps)', async () => {
    const { result } = renderHook(() => usePdsGoalCalculator(), {
      wrapper: ({ children }) => (
        <PdsGoalCalculatorTestWrapper
          calculationMock={{ formType: DesignationSupportFormType.Simple }}
        >
          {children}
        </PdsGoalCalculatorTestWrapper>
      ),
    });

    await waitFor(() => expect(result.current.steps).toHaveLength(3));
    expect(result.current.steps.map((s) => s.step)).toEqual([
      PdsGoalCalculatorStepEnum.Setup,
      PdsGoalCalculatorStepEnum.SupportItem,
      PdsGoalCalculatorStepEnum.SummaryReport,
    ]);
  });

  it('handleContinue advances to the next step', () => {
    const { result } = renderUsePdsGoalCalculator();

    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.handleContinue());
    expect(result.current.stepIndex).toBe(1);
  });

  it('handlePreviousStep goes back to the previous step', () => {
    const { result } = renderUsePdsGoalCalculator();

    act(() => result.current.handleContinue());
    expect(result.current.stepIndex).toBe(1);

    act(() => result.current.handlePreviousStep());
    expect(result.current.stepIndex).toBe(0);
  });

  it('handlePreviousStep does nothing on the first step', () => {
    const { result } = renderUsePdsGoalCalculator();

    expect(result.current.stepIndex).toBe(0);

    act(() => result.current.handlePreviousStep());
    expect(result.current.stepIndex).toBe(0);
  });

  it('exposes percentComplete reflecting current step / total steps', () => {
    const { result } = renderUsePdsGoalCalculator();

    expect(result.current.percentComplete).toBe(25);
    act(() => result.current.handleContinue());
    expect(result.current.percentComplete).toBe(50);
    act(() => result.current.handleContinue());
    expect(result.current.percentComplete).toBe(75);
    act(() => result.current.handleContinue());
    expect(result.current.percentComplete).toBe(100);
  });

  describe('preserves the user step when the steps array changes', () => {
    const reconcileMessage =
      'Returned to Setup because the current step is no longer available.';

    afterEach(() => {
      mockedUseSteps.mockImplementation(
        jest.requireActual<typeof import('./useSteps')>('./useSteps').useSteps,
      );
    });

    it.each([
      {
        name: 'keeps the user on SummaryReport when steps shrink Detailed → Simple',
        initialSteps: detailedSteps,
        click: 'go to summary',
        newSteps: simpleSteps,
        expectedStep: PdsGoalCalculatorStepEnum.SummaryReport,
        expectedIndex: '2',
        expectSnackbar: false,
      },
      {
        name: 'falls back to Setup and notifies when current step does not exist in new form',
        initialSteps: detailedSteps,
        click: 'go to reimbursable',
        newSteps: simpleSteps,
        expectedStep: PdsGoalCalculatorStepEnum.Setup,
        expectedIndex: '0',
        expectSnackbar: true,
      },
      {
        name: 'reconciles to the first step and notifies when an active step past index 1 disappears',
        initialSteps: detailedSteps,
        click: 'go to support item',
        newSteps: minimalSteps,
        expectedStep: PdsGoalCalculatorStepEnum.Setup,
        expectedIndex: '0',
        expectSnackbar: true,
      },
      {
        name: 'keeps the user on SupportItem when steps grow Simple → Detailed',
        initialSteps: simpleSteps,
        click: 'go to support item',
        newSteps: detailedSteps,
        expectedStep: PdsGoalCalculatorStepEnum.SupportItem,
        expectedIndex: '2',
        expectSnackbar: false,
      },
    ])(
      '$name',
      async ({
        initialSteps,
        click,
        newSteps,
        expectedStep,
        expectedIndex,
        expectSnackbar,
      }) => {
        mockedUseSteps.mockReturnValue(initialSteps);
        const { findByTestId, findByText, getByRole, queryByText, rerender } =
          render(
            <PdsGoalCalculatorTestWrapper>
              <StepProbe />
            </PdsGoalCalculatorTestWrapper>,
          );

        userEvent.click(getByRole('button', { name: click }));

        mockedUseSteps.mockReturnValue(newSteps);
        rerender(
          <PdsGoalCalculatorTestWrapper>
            <StepProbe />
          </PdsGoalCalculatorTestWrapper>,
        );

        expect(await findByTestId('current-step')).toHaveTextContent(
          expectedStep,
        );
        expect(await findByTestId('step-index')).toHaveTextContent(
          expectedIndex,
        );

        const snackbar = expectSnackbar
          ? await findByText(reconcileMessage)
          : queryByText(reconcileMessage);
        expect(Boolean(snackbar)).toBe(expectSnackbar);
      },
    );

    it('reconciles activeStep state so toggling formType back does not teleport the user', async () => {
      mockedUseSteps.mockReturnValue(detailedSteps);
      const { findByTestId, getByRole, rerender } = render(
        <PdsGoalCalculatorTestWrapper>
          <StepProbe />
        </PdsGoalCalculatorTestWrapper>,
      );

      userEvent.click(getByRole('button', { name: 'go to reimbursable' }));

      mockedUseSteps.mockReturnValue(simpleSteps);
      rerender(
        <PdsGoalCalculatorTestWrapper>
          <StepProbe />
        </PdsGoalCalculatorTestWrapper>,
      );

      expect(await findByTestId('current-step')).toHaveTextContent(
        PdsGoalCalculatorStepEnum.Setup,
      );

      mockedUseSteps.mockReturnValue(detailedSteps);
      rerender(
        <PdsGoalCalculatorTestWrapper>
          <StepProbe />
        </PdsGoalCalculatorTestWrapper>,
      );

      expect(await findByTestId('current-step')).toHaveTextContent(
        PdsGoalCalculatorStepEnum.Setup,
      );
      expect(await findByTestId('step-index')).toHaveTextContent('0');
    });
  });
});
