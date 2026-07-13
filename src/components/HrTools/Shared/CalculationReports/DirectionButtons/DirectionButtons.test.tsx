import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { MinisterHousingAllowanceProvider } from 'src/components/HrTools/MinisterHousingAllowance/Shared/Context/MinisterHousingAllowanceContext';
import theme from 'src/theme';
import { DirectionButtons } from './DirectionButtons';

const title = 'Submit this form';

const submit = jest.fn();
const pushMock = jest.fn();
const handleNextStep = jest.fn();
const handlePreviousStep = jest.fn();
const handleDiscard = jest.fn();
const overrideNext = jest.fn();

interface TestComponentProps {
  isSubmission?: boolean;
  overrideNext?: () => void;
  showBackButton?: boolean;
  buttonTitle?: string;
  isEdit?: boolean;
  disableNext?: boolean;
  disabledNextTooltip?: string;
  loadingNext?: boolean;
  loadingNextTitle?: string;
  noDiscard?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  isSubmission = false,
  overrideNext,
  showBackButton = false,
  buttonTitle,
  isEdit,
  disableNext,
  disabledNextTooltip,
  loadingNext,
  loadingNextTitle,
  noDiscard = false,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter
      router={{
        query: { accountListId: 'account-list-1' },
      }}
    >
      <SnackbarProvider>
        <GqlMockedProvider>
          <Formik initialValues={{}} onSubmit={submit}>
            <MinisterHousingAllowanceProvider>
              <DirectionButtons
                formTitle="MHA Request"
                isSubmission={isSubmission}
                handleNextStep={handleNextStep}
                handlePreviousStep={handlePreviousStep}
                handleDiscard={noDiscard ? undefined : handleDiscard}
                overrideNext={overrideNext}
                showBackButton={showBackButton}
                buttonTitle={buttonTitle}
                isEdit={isEdit}
                disableNext={disableNext}
                disabledNextTooltip={disabledNextTooltip}
                loadingNext={loadingNext}
                loadingNextTitle={loadingNextTitle}
              />
            </MinisterHousingAllowanceProvider>
          </Formik>
        </GqlMockedProvider>
      </SnackbarProvider>
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

  it('renders Discard button', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: /discard/i }),
    ).toBeInTheDocument();
  });

  it('shows tooltip when Continue button is disabled', async () => {
    const { findByRole, findByText } = render(
      <TestComponent disableNext={true} />,
    );

    const continueButton = await findByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    userEvent.hover(continueButton.parentElement!);

    expect(
      await findByText('Complete all fields to continue'),
    ).toBeInTheDocument();
  });

  it('does not show tooltip when Continue button is enabled', async () => {
    const { findByRole, queryByText } = render(<TestComponent />);

    const continueButton = await findByRole('button', { name: 'Continue' });
    expect(continueButton).toBeEnabled();

    userEvent.hover(continueButton.parentElement!);

    await waitFor(() => {
      expect(
        queryByText('Complete all fields to continue'),
      ).not.toBeInTheDocument();
    });
  });

  it('shows the custom disabledNextTooltip when provided and Next is disabled', async () => {
    const { findByRole, findByText, queryByText } = render(
      <TestComponent
        disableNext={true}
        disabledNextTooltip="Complete all fields to submit"
      />,
    );

    const continueButton = await findByRole('button', { name: 'Continue' });
    expect(continueButton).toBeDisabled();

    userEvent.hover(continueButton.parentElement!);

    expect(
      await findByText('Complete all fields to submit'),
    ).toBeInTheDocument();
    expect(
      queryByText('Complete all fields to continue'),
    ).not.toBeInTheDocument();
  });

  it('shows the loadingNextTitle with an in-button spinner and disables the button while loadingNext is true', async () => {
    const { findByRole } = render(
      <TestComponent
        buttonTitle="Apply Goal to MPDX"
        loadingNext={true}
        loadingNextTitle="Saving..."
      />,
    );

    const savingButton = await findByRole('button', { name: 'Saving...' });
    expect(savingButton).toBeDisabled();
    expect(
      savingButton.querySelector('.MuiCircularProgress-root'),
    ).toBeInTheDocument();
  });

  it('suppresses the disabledNextTooltip while loadingNext is true', async () => {
    const { findByRole, queryByText } = render(
      <TestComponent
        disableNext={true}
        disabledNextTooltip="Complete all fields to submit"
        loadingNext={true}
        loadingNextTitle="Saving..."
      />,
    );

    const savingButton = await findByRole('button', { name: 'Saving...' });
    userEvent.hover(savingButton.parentElement!);

    await waitFor(() => {
      expect(
        queryByText('Complete all fields to submit'),
      ).not.toBeInTheDocument();
    });
  });

  it('renders Discard, Back, and Continue in left-to-right order', async () => {
    const { findAllByRole } = render(<TestComponent showBackButton={true} />);

    const buttons = await findAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent(/discard/i);
    expect(buttons[1]).toHaveTextContent(/back/i);
    expect(buttons[2]).toHaveTextContent(/continue/i);
  });

  it('renders Discard, Back, and Submit in left-to-right order during submission', async () => {
    const { findAllByRole } = render(
      <TestComponent showBackButton={true} isSubmission={true} />,
    );

    const buttons = await findAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent(/discard/i);
    expect(buttons[1]).toHaveTextContent(/back/i);
    expect(buttons[2]).toHaveTextContent(/submit/i);
  });

  it('renders Back to the left of Continue when there is no Discard handler', async () => {
    const { findAllByRole } = render(
      <TestComponent noDiscard={true} showBackButton={true} />,
    );

    const buttons = await findAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent(/back/i);
    expect(buttons[1]).toHaveTextContent(/continue/i);
  });

  it('renders only Continue (right-aligned) when there is no Discard, no Back, and not a submission', async () => {
    const { findAllByRole } = render(<TestComponent noDiscard={true} />);

    const buttons = await findAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent(/continue/i);

    // The Continue button's wrapper Box uses `ml: 'auto'` to push it to the
    // right edge when no left-side controls are rendered. Walk up from the
    // button to confirm that wrapper is the only child of the outer flex row.
    const outerRow = buttons[0].closest('.MuiBox-root')?.parentElement;
    expect(outerRow?.children).toHaveLength(1);
  });

  it('renders Discard Changes button', async () => {
    const { findByRole, getByRole } = render(<TestComponent isEdit={true} />);

    const discardButton = await findByRole('button', {
      name: /discard changes/i,
    });
    expect(discardButton).toBeInTheDocument();

    userEvent.click(discardButton);

    await waitFor(() => {
      expect(
        getByRole('heading', {
          name: 'Do you want to discard these changes?',
        }),
      ).toBeInTheDocument();
    });

    const confirmDiscard = getByRole('button', {
      name: /yes, discard changes/i,
    });
    userEvent.click(confirmDiscard);

    expect(handleDiscard).toHaveBeenCalled();
  });
});
