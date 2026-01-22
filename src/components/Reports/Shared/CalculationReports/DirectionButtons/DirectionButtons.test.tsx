import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MinisterHousingAllowanceProvider } from 'src/components/Reports/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import theme from 'src/theme';
import { DirectionButtons } from './DirectionButtons';

const title = 'Submit this form';

const submit = jest.fn();
const pushMock = jest.fn();
const handleNextStep = jest.fn();
const handlePreviousStep = jest.fn();
const overrideNext = jest.fn();
const handleDiscard = jest.fn();

interface TestComponentProps {
  isSubmission?: boolean;
  overrideNext?: () => void;
  showBackButton?: boolean;
  buttonTitle?: string;
  handleDiscard?: () => void;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isSubmission = false,
  overrideNext,
  showBackButton = false,
  buttonTitle,
  handleDiscard: handleDiscardProp,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1' },
      }}
    >
      <GqlMockedProvider>
        <Formik initialValues={{}} onSubmit={submit}>
          <MinisterHousingAllowanceProvider>
            <DirectionButtons
              isSubmission={isSubmission}
              handleNextStep={handleNextStep}
              handlePreviousStep={handlePreviousStep}
              overrideNext={overrideNext}
              showBackButton={showBackButton}
              buttonTitle={buttonTitle}
              handleDiscard={handleDiscardProp}
            />
          </MinisterHousingAllowanceProvider>
        </Formik>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

jest.mock('src/hooks/useAccountListId', () => ({
  useAccountListId: () => 'account-list-1',
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('DirectionButtons', () => {
  it('renders Back and Submit buttons', async () => {
    const { getByRole, findByRole } = render(
      <TestComponent isSubmission={true} showBackButton={true} />,
    );

    expect(await findByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls handleNext when Continue is clicked', async () => {
    const { findByRole } = render(<TestComponent />);

    userEvent.click(await findByRole('button', { name: 'Continue' }));

    expect(handleNextStep).toHaveBeenCalled();
  });

  it('calls overrideNext when provided and Continue is clicked', async () => {
    const { findByRole } = render(
      <TestComponent overrideNext={overrideNext} />,
    );

    userEvent.click(await findByRole('button', { name: 'Continue' }));

    expect(handleNextStep).not.toHaveBeenCalled();
    expect(overrideNext).toHaveBeenCalled();
  });

  it('calls handlePreviousStep when Back is clicked', async () => {
    const { findByRole } = render(<TestComponent showBackButton={true} />);

    userEvent.click(await findByRole('button', { name: /back/i }));

    expect(handlePreviousStep).toHaveBeenCalled();
  });

  it('renders custom button title when provided', async () => {
    const { findByRole } = render(<TestComponent buttonTitle={title} />);

    expect(await findByRole('button', { name: title })).toBeInTheDocument();
  });

  it('renders Cancel button when handleDiscard is provided', async () => {
    const { findByRole } = render(
      <TestComponent handleDiscard={handleDiscard} />,
    );

    expect(
      await findByRole('button', { name: /discard/i }),
    ).toBeInTheDocument();
  });

  it('does not render Cancel button when handleDiscard is not provided', () => {
    const { queryByRole } = render(<TestComponent />);

    expect(queryByRole('button', { name: /discard/i })).not.toBeInTheDocument();
  });

  it('calls handleDiscard when Cancel button is clicked', async () => {
    const { findByRole } = render(
      <TestComponent handleDiscard={handleDiscard} />,
    );

    userEvent.click(await findByRole('button', { name: /discard/i }));

    expect(handleDiscard).toHaveBeenCalled();
  });
});
