import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewStaffQuestionnaireVariantEnum } from 'src/graphql/types.generated';
import { NsoMpdQuestionnaireStepEnum } from '../NsoMpdQuestionnaireHelper';
import {
  NsoMpdQuestionnaireTestWrapper,
  NsoMpdQuestionnaireTestWrapperProps,
} from '../NsoMpdQuestionnaireTestWrapper';
import { useNsoMpdQuestionnaire } from './NsoMpdQuestionnaireContext';
import { NsoMpdQuestionnaireLayout } from './NsoMpdQuestionnaireLayout';

interface HarnessProps {
  initialStep?: NsoMpdQuestionnaireStepEnum;
}

const Harness: React.FC<HarnessProps> = ({ initialStep }) => {
  const { handleStepChange } = useNsoMpdQuestionnaire();

  useEffect(() => {
    if (initialStep) {
      handleStepChange(initialStep);
    }
  }, [initialStep, handleStepChange]);

  return (
    <NsoMpdQuestionnaireLayout>
      <div>Main panel content</div>
    </NsoMpdQuestionnaireLayout>
  );
};

type TestComponentProps = Omit<
  NsoMpdQuestionnaireTestWrapperProps,
  'children'
> &
  HarnessProps;

const TestComponent: React.FC<TestComponentProps> = ({
  initialStep,
  ...wrapperProps
}) => (
  <NsoMpdQuestionnaireTestWrapper {...wrapperProps}>
    <Harness initialStep={initialStep} />
  </NsoMpdQuestionnaireTestWrapper>
);

const filledDebtFields = {
  studentLoanMonthlyPayment: 0,
  carLoanMonthlyPayment: 0,
  creditCardDebtMonthlyPayment: 0,
};

describe('NsoMpdQuestionnaireLayout', () => {
  it('renders an icon in the rail for every view step', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'Questionnaire Step 1' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 2' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 3' }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: 'Questionnaire Step 4' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Summary' })).toBeInTheDocument();
  });

  it('marks the current view step icon as active', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'Questionnaire Step 1' }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('renders a back arrow to the dashboard', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('link', { name: 'Back to dashboard' }),
    ).toBeInTheDocument();
  });

  it('renders the main content slot', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Main panel content')).toBeInTheDocument();
  });

  it('disables the non-current step icons so users cannot jump between steps', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('button', { name: 'Questionnaire Step 2' }),
    ).toBeDisabled();
    expect(
      getByRole('button', { name: 'Questionnaire Step 3' }),
    ).toBeDisabled();
    expect(
      getByRole('button', { name: 'Questionnaire Step 4' }),
    ).toBeDisabled();
  });

  it('keeps the current step icon interactive', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Questionnaire Step 1' })).toBeEnabled();
  });

  it('shows the Continue button on non-final steps', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('hides the Continue button on the last step', () => {
    const { queryByRole } = render(
      <TestComponent initialStep={NsoMpdQuestionnaireStepEnum.Summary} />,
    );

    expect(queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument();
  });

  it('hides the Back button on the first step', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('shows the Back button on later steps and returns to the previous step', () => {
    const { getByRole } = render(
      <TestComponent
        initialStep={NsoMpdQuestionnaireStepEnum.FinancialInformation}
      />,
    );
    expect(
      getByRole('button', { name: 'Questionnaire Step 3' }),
    ).toHaveAttribute('aria-current', 'step');

    userEvent.click(getByRole('button', { name: 'Back' }));

    expect(
      getByRole('button', { name: 'Questionnaire Step 2' }),
    ).toHaveAttribute('aria-current', 'step');
  });

  it('shows 75% in the progress ring when only the debt fields are missing', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '75');
  });

  it('shows 100% in the progress ring when every step is complete', async () => {
    const { findByRole } = render(
      <TestComponent newStaffQuestionnaire={{ ...filledDebtFields }} />,
    );

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows 50% when the ministry and financial steps are both incomplete', async () => {
    const { findByRole } = render(
      <TestComponent newStaffQuestionnaire={{ ministryName: null }} />,
    );

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '50');
  });

  it('counts the Sosa variant field toward the financial step', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.Sosa,
          healthcareDependentsCount: null,
          ...filledDebtFields,
        }}
      />,
    );

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '75');
  });

  it('completes the financial step with every SpouseSeniorStaff variant field', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff,
          spouseRequestedAnnualSalary: 40000,
          spouseContribution403bPercentage: 0,
          spouseMhaAmount: 0,
          staffConferenceTransfer: 0,
          accountTransfers: 0,
          solidSupportRaised: 1000,
          ...filledDebtFields,
        }}
      />,
    );

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '100');
  });

  it('shows 25% when only the review-only personal step is complete', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          variant: NewStaffQuestionnaireVariantEnum.SingleMarried,
          ministryName: null,
          ministryLocation: null,
          geographicLocation: null,
          assignmentType: null,
          nsoHousing: null,
          nsoSessions: null,
          nsoSpecialNeedsSupportReceived: null,
          childcareChildrenCount: null,
        }}
      />,
    );

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '25');
  });

  it('treats an empty-string answer as unfilled', async () => {
    const { findByRole } = render(
      <TestComponent
        newStaffQuestionnaire={{
          ministryName: '',
          ...filledDebtFields,
        }}
      />,
    );

    expect(
      await findByRole('progressbar', { name: 'Form Progress' }),
    ).toHaveAttribute('aria-valuenow', '75');
  });
});
