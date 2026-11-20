import React, { useEffect } from 'react';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18n from 'src/lib/i18n';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';

const mutationSpy = jest.fn();

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

const ReadOnlyComponent: React.FC = () => {
  const { currentStep, readOnly, saveField, completeQuestionnaire } =
    useNsoMpdQuestionnaire();
  return (
    <div>
      <h2>{currentStep.title}</h2>
      <div aria-label="read only state" data-read-only={readOnly} />
      <button onClick={() => saveField({ phoneNumber: '305-555-1234' })}>
        Save
      </button>
      <button onClick={() => completeQuestionnaire()}>complete</button>
    </div>
  );
};

interface InnerComponentProps {
  initialStep?: NsoMpdQuestionnaireStepEnum;
}

const InnerComponent: React.FC<InnerComponentProps> = ({ initialStep }) => {
  const {
    currentStep,
    isLastStep,
    handleStepChange,
    handleContinue,
    handleBack,
  } = useNsoMpdQuestionnaire();

  useEffect(() => {
    if (initialStep) {
      handleStepChange(initialStep);
    }
  }, [initialStep, handleStepChange]);

  return (
    <div>
      <h2>{currentStep.title}</h2>
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
      <button onClick={handleBack}>Back</button>
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

  it('goes back to the previous step', () => {
    const { getByRole } = render(
      <TestComponent
        initialStep={NsoMpdQuestionnaireStepEnum.FinancialInformation}
      />,
    );
    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 3');

    userEvent.click(getByRole('button', { name: 'Back' }));
    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 2');
  });

  it('does not go back before the first step', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 1');

    userEvent.click(getByRole('button', { name: 'Back' }));
    expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 1');
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

  it('fires the upsert mutation with coerced attributes', async () => {
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
  describe('submitted questionnaire', () => {
    const renderSubmitted = () =>
      render(
        <NsoMpdQuestionnaireTestWrapper
          onCall={mutationSpy}
          newStaffQuestionnaire={{ completed: true }}
        >
          <ReadOnlyComponent />
        </NsoMpdQuestionnaireTestWrapper>,
      );

    it('opens on the Summary step and reports read-only', async () => {
      const { getByRole, getByLabelText } = renderSubmitted();

      await waitFor(() =>
        expect(getByLabelText('read only state')).toHaveAttribute(
          'data-read-only',
          'true',
        ),
      );
      expect(getByRole('heading')).toHaveTextContent('Summary');
    });

    it('keeps the reader on the step they picked when the language changes', async () => {
      const { getByRole } = render(
        <NsoMpdQuestionnaireTestWrapper
          newStaffQuestionnaire={{ completed: true }}
        >
          <InnerComponent />
        </NsoMpdQuestionnaireTestWrapper>,
      );
      await waitFor(() =>
        expect(getByRole('heading')).toHaveTextContent('Summary'),
      );
      userEvent.click(getByRole('button', { name: 'Back' }));

      try {
        await act(async () => {
          await i18n.changeLanguage('fr');
        });

        expect(getByRole('heading')).toHaveTextContent('Questionnaire Step 4');
      } finally {
        await act(async () => {
          await i18n.changeLanguage('en');
        });
      }
    });

    it('is read-only once the deadline locks it, even unsubmitted', async () => {
      const { getByLabelText } = render(
        <NsoMpdQuestionnaireTestWrapper
          newStaffQuestionnaire={{ completed: false, locked: true }}
        >
          <ReadOnlyComponent />
        </NsoMpdQuestionnaireTestWrapper>,
      );

      await waitFor(() =>
        expect(getByLabelText('read only state')).toHaveAttribute(
          'data-read-only',
          'true',
        ),
      );
    });

    it('sends no update or complete mutation', async () => {
      const { getByRole, getByLabelText } = renderSubmitted();
      await waitFor(() =>
        expect(getByLabelText('read only state')).toHaveAttribute(
          'data-read-only',
          'true',
        ),
      );

      userEvent.click(getByRole('button', { name: 'Save' }));
      userEvent.click(getByRole('button', { name: 'complete' }));
      await act(async () => {});

      expect(mutationSpy).not.toHaveGraphqlOperation(
        'UpdateNewStaffQuestionnaire',
      );
      expect(mutationSpy).not.toHaveGraphqlOperation(
        'CompleteNewStaffQuestionnaire',
      );
    });
  });
});
