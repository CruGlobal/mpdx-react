import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsGoalCalculatorStepEnum } from '../NsGoalCalculatorHelper';
import { NsGoalCalculatorTestWrapper } from '../NsGoalCalculatorTestWrapper';
import { useNsGoalCalculator } from './NsGoalCalculatorContext';

interface InnerComponentProps {
  initialStep?: NsGoalCalculatorStepEnum;
}

const InnerComponent: React.FC<InnerComponentProps> = ({ initialStep }) => {
  const {
    currentStep,
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
  } = useNsGoalCalculator();

  useEffect(() => {
    if (initialStep) {
      handleStepChange(initialStep);
    }
  }, [initialStep, handleStepChange]);

  return (
    <div>
      <h2>{currentStep.title}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <button
        onClick={() =>
          handleStepChange(NsGoalCalculatorStepEnum.PresentingYourGoal)
        }
      >
        Change Step
      </button>
      <button onClick={handleContinue}>Continue</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
    </div>
  );
};

const TestComponent: React.FC<InnerComponentProps> = (props) => (
  <NsGoalCalculatorTestWrapper>
    <InnerComponent {...props} />
  </NsGoalCalculatorTestWrapper>
);

describe('NsGoalCalculatorContext', () => {
  it('provides the first step as the initial state', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading')).toHaveTextContent('Review Your Calculation');
  });

  it('changes to the requested step', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Change Step' }));
    expect(getByRole('heading')).toHaveTextContent('Presenting Your Goal');
  });

  it('continues to the next step', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading')).toHaveTextContent('Presenting Your Goal');
  });

  it('ignores a change to an unknown step', () => {
    const { getByRole } = render(
      <TestComponent
        initialStep={'not-a-real-step' as NsGoalCalculatorStepEnum}
      />,
    );

    expect(getByRole('heading')).toHaveTextContent('Review Your Calculation');
  });

  it('does not continue past the last step', () => {
    const { getByRole } = render(
      <TestComponent initialStep={NsGoalCalculatorStepEnum.NextSteps} />,
    );
    expect(getByRole('heading')).toHaveTextContent('Next Steps');

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading')).toHaveTextContent('Next Steps');
  });

  it('toggles the drawer state', () => {
    const { getByRole, getByLabelText } = render(<TestComponent />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });
});
