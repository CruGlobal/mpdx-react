import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { act, render, renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdsGoalCalculatorStepEnum } from '../PdsGoalCalculatorHelper';
import { PdsGoalCalculatorTestWrapper } from '../PdsGoalCalculatorTestWrapper';
import { usePdsGoalCalculator } from './PdsGoalCalculatorContext';
import { useSteps } from './useSteps';
import type { PdsGoalCalculatorStep } from './useSteps';

jest.mock('./useSteps', () => ({
  __esModule: true,
  ...jest.requireActual('./useSteps'),
  useSteps: jest.fn(),
}));

const mockedUseSteps = useSteps as jest.MockedFunction<typeof useSteps>;

const stub = (step: PdsGoalCalculatorStepEnum): PdsGoalCalculatorStep => ({
  step,
  title: step,
  icon: <SettingsIcon />,
  sections: [],
});

const detailedSteps: PdsGoalCalculatorStep[] = [
  stub(PdsGoalCalculatorStepEnum.Setup),
  stub(PdsGoalCalculatorStepEnum.ReimbursableExpenses),
  stub(PdsGoalCalculatorStepEnum.SupportItem),
  stub(PdsGoalCalculatorStepEnum.SummaryReport),
];

const simpleSteps: PdsGoalCalculatorStep[] = [
  stub(PdsGoalCalculatorStepEnum.Setup),
  stub(PdsGoalCalculatorStepEnum.SupportItem),
  stub(PdsGoalCalculatorStepEnum.SummaryReport),
];

const minimalSteps: PdsGoalCalculatorStep[] = [
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
      <div data-testid="current-step">{currentStep?.step ?? 'none'}</div>
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
        onClick={() =>
          handleStepChange(PdsGoalCalculatorStepEnum.SupportItem)
        }
      >
        go to support item
      </button>
    </div>
  );
};

beforeEach(() => {
  mockedUseSteps.mockReturnValue(detailedSteps);
});

describe('PdsGoalCalculatorContext', () => {
  it('provides steps and current step', () => {
    const { result } = renderUsePdsGoalCalculator();

    expect(result.current.steps).toHaveLength(4);
    expect(result.current.currentStep.step).toBe('setup');
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

  describe('preserves the user step when the steps array changes', () => {
    it.each([
      {
        name: 'keeps the user on SummaryReport when steps shrink Detailed → Simple',
        initialSteps: detailedSteps,
        click: 'go to summary',
        newSteps: simpleSteps,
        expectedStep: PdsGoalCalculatorStepEnum.SummaryReport,
        expectedIndex: '2',
      },
      {
        name: 'falls back to Setup when current step does not exist in new form',
        initialSteps: detailedSteps,
        click: 'go to reimbursable',
        newSteps: simpleSteps,
        expectedStep: PdsGoalCalculatorStepEnum.Setup,
        expectedIndex: '0',
      },
      {
        name: 'reconciles to the first step when an active step past index 1 disappears',
        initialSteps: detailedSteps,
        click: 'go to support item',
        newSteps: minimalSteps,
        expectedStep: PdsGoalCalculatorStepEnum.Setup,
        expectedIndex: '0',
      },
      {
        name: 'keeps the user on SupportItem when steps grow Simple → Detailed',
        initialSteps: simpleSteps,
        click: 'go to support item',
        newSteps: detailedSteps,
        expectedStep: PdsGoalCalculatorStepEnum.SupportItem,
        expectedIndex: '2',
      },
    ])(
      '$name',
      async ({ initialSteps, click, newSteps, expectedStep, expectedIndex }) => {
        mockedUseSteps.mockReturnValue(initialSteps);
        const { findByTestId, getByRole, rerender } = render(
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
      },
    );
  });
});
