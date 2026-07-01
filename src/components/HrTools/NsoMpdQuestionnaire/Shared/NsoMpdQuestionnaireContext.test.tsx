import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

const CompleteComponent: React.FC = () => {
  const { completeQuestionnaire } = useNsoMpdQuestionnaire();
  return <button onClick={() => completeQuestionnaire()}>complete</button>;
};

const SaveComponent: React.FC = () => {
  const { saveField } = useNsoMpdQuestionnaire();
  return (
    <button onClick={() => saveField({ phoneNumber: '305-555-1234' })}>
      Save
    </button>
  );
};

interface InnerComponentProps {
  initialStep?: NsoMpdQuestionnaireStepEnum;
}

const InnerComponent: React.FC<InnerComponentProps> = ({ initialStep }) => {
  const {
    currentStep,
    isLastStep,
    isDrawerOpen,
    handleStepChange,
    handleContinue,
    toggleDrawer,
  } = useNsoMpdQuestionnaire();

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
      <div aria-label="last step state" data-last={isLastStep}>
        Last step: {isLastStep ? 'yes' : 'no'}
      </div>
      <button
        onClick={() =>
          handleStepChange(NsoMpdQuestionnaireStepEnum.FinancialInformation)
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
  <NsoMpdQuestionnaireTestWrapper>
    <InnerComponent {...props} />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('NsoMpdQuestionnaireContext', () => {
  it('provides the first step as the initial state', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 1');
  });

  it('changes to the requested step', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Change Step' }));
    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 3');
  });

  it('continues to the next step', () => {
    const { getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 2');
  });

  it('does not continue past the last step', () => {
    const { getByRole } = render(
      <TestComponent initialStep={NsoMpdQuestionnaireStepEnum.Summary} />,
    );
    expect(getByRole('heading')).toHaveTextContent('Summary');

    userEvent.click(getByRole('button', { name: 'Continue' }));
    expect(getByRole('heading')).toHaveTextContent('Summary');
  });

  it('reports the last step', () => {
    const { getByLabelText } = render(<TestComponent />);

    expect(getByLabelText('last step state')).toHaveAttribute(
      'data-last',
      'false',
    );
  });

  it('toggles the drawer state', () => {
    const { getByRole, getByLabelText } = render(<TestComponent />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');
  });

  it('fires the upsert mutation with coerced attributes', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <NsoMpdQuestionnaireTestWrapper onCall={mutationSpy}>
        <SaveComponent />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    userEvent.click(getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
        {
          input: {
            accountListId: 'account-list-1',
            attributes: { phoneNumber: '305-555-1234' },
          },
        },
      ),
    );
  });

  it('completeQuestionnaire fires the CompleteNewStaffQuestionnaire mutation', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(
      <NsoMpdQuestionnaireTestWrapper onCall={mutationSpy}>
        <CompleteComponent />
      </NsoMpdQuestionnaireTestWrapper>,
    );

    userEvent.click(getByRole('button', { name: 'complete' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation(
        'CompleteNewStaffQuestionnaire',
        {
          input: { accountListId: 'account-list-1' },
        },
      ),
    );
  });
});
