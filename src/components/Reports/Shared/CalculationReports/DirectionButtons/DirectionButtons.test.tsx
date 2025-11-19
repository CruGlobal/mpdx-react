import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { DirectionButtons } from './DirectionButtons';

const title = 'Submit this form';

const submit = jest.fn();
const pushMock = jest.fn();
const handleNextStep = jest.fn();
const handlePreviousStep = jest.fn();
const overrideNext = jest.fn();

interface TestComponentProps {
  isSubmission?: boolean;
  overrideNext?: () => void;
  showBackButton?: boolean;
  buttonTitle?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isSubmission = false,
  overrideNext,
  showBackButton = false,
  buttonTitle,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1' },
      }}
    >
      <Formik initialValues={{}} onSubmit={submit}>
        <DirectionButtons
          isSubmission={isSubmission}
          handleNextStep={handleNextStep}
          handlePreviousStep={handlePreviousStep}
          overrideNext={overrideNext}
          showBackButton={showBackButton}
          buttonTitle={buttonTitle}
        />
      </Formik>
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
  it('renders Back and Submit buttons', () => {
    const { getByRole } = render(
      <TestComponent isSubmission={true} showBackButton={true} />,
    );

    expect(getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('calls handleNext when Continue is clicked', async () => {
    const { getByRole } = render(<TestComponent />);

    await userEvent.click(getByRole('button', { name: 'Continue' }));

    expect(handleNextStep).toHaveBeenCalled();
  });

  it('calls overrideNext when provided and Continue is clicked', async () => {
    const { getByRole } = render(<TestComponent overrideNext={overrideNext} />);

    await userEvent.click(getByRole('button', { name: 'Continue' }));

    expect(handleNextStep).not.toHaveBeenCalled();
    expect(overrideNext).toHaveBeenCalled();
  });

  it('calls handlePreviousStep when Back is clicked', async () => {
    const { getByRole } = render(
      <TestComponent isSubmission={true} showBackButton={true} />,
    );

    await userEvent.click(getByRole('button', { name: /back/i }));

    expect(handlePreviousStep).toHaveBeenCalled();
  });

  it('renders custom button title when provided', () => {
    const { getByRole } = render(<TestComponent buttonTitle={title} />);

    expect(getByRole('button', { name: title })).toBeInTheDocument();
  });
});
