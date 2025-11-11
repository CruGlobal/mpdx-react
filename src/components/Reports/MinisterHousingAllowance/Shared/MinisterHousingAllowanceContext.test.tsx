import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { getByRole, render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from './MinisterHousingAllowanceContext';
import {
  EditRequestStepsEnum,
  NewRequestStepsEnum,
  PageEnum,
} from './sharedTypes';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <MinisterHousingAllowanceProvider type={PageEnum.New}>
        {<div>Test Children</div>}
      </MinisterHousingAllowanceProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

function FailedConsumer() {
  const context = useMinisterHousingAllowance();
  return <div>{JSON.stringify(context)}</div>;
}

function TestConsumer() {
  const {
    steps,
    currentStep,
    handleNextStep,
    handlePreviousStep,
    percentComplete,
    currentEditStep,
    percentEditComplete,
    handleEditNextStep,
    handleEditPreviousStep,
  } = useMinisterHousingAllowance();

  return (
    <div>
      <div data-testid="steps">{steps.length}</div>
      <div data-testid="currentStep">{currentStep}</div>
      <div data-testid="percentCompleteNew">{percentComplete}</div>
      <button onClick={handleNextStep}>Next (New)</button>
      <button onClick={handlePreviousStep}>Previous (New)</button>

      <div data-testid="currentEditStep">{currentEditStep}</div>
      <div data-testid="percentCompleteEdit">{percentEditComplete}</div>
      <button onClick={handleEditNextStep}>Next (Edit)</button>
      <button onClick={handleEditPreviousStep}>Previous (Edit)</button>
    </div>
  );
}

describe('MinisterHousingAllowanceContext', () => {
  it('throws an error when used outside of the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find MinisterHousingAllowanceContext/i,
    );
    spy.mockRestore();
  });

  it('provides initial state for new page', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <MinisterHousingAllowanceProvider type={PageEnum.New}>
            <TestConsumer />
          </MinisterHousingAllowanceProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentStep')).toHaveTextContent(
      NewRequestStepsEnum.AboutForm,
    );
    expect(getByTestId('percentCompleteNew')).toHaveTextContent('25');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Next (New)' }),
    );
    expect(getByTestId('currentStep')).toHaveTextContent(
      NewRequestStepsEnum.RentOrOwn,
    );
    expect(getByTestId('percentCompleteNew')).toHaveTextContent('50');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Next (New)' }),
    );
    expect(getByTestId('currentStep')).toHaveTextContent(
      NewRequestStepsEnum.Calculate,
    );
    expect(getByTestId('percentCompleteNew')).toHaveTextContent('75');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Next (New)' }),
    );
    expect(getByTestId('currentStep')).toHaveTextContent(
      NewRequestStepsEnum.Receipt,
    );
    expect(getByTestId('percentCompleteNew')).toHaveTextContent('100');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Previous (New)' }),
    );
    expect(getByTestId('currentStep')).toHaveTextContent(
      NewRequestStepsEnum.Calculate,
    );
    expect(getByTestId('percentCompleteNew')).toHaveTextContent('75');
  });

  it('provides initial state for edit page', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <MinisterHousingAllowanceProvider type={PageEnum.Edit}>
            <TestConsumer />
          </MinisterHousingAllowanceProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('steps')).toHaveTextContent('3');
    expect(getByTestId('currentEditStep')).toHaveTextContent(
      EditRequestStepsEnum.RentOrOwn,
    );
    expect(getByTestId('percentCompleteEdit')).toHaveTextContent('33');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Next (Edit)' }),
    );
    expect(getByTestId('currentEditStep')).toHaveTextContent(
      EditRequestStepsEnum.Edit,
    );
    expect(getByTestId('percentCompleteEdit')).toHaveTextContent('66');
    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Next (Edit)' }),
    );
    expect(getByTestId('currentEditStep')).toHaveTextContent(
      EditRequestStepsEnum.Receipt,
    );
    expect(getByTestId('percentCompleteEdit')).toHaveTextContent('100');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Previous (Edit)' }),
    );
    expect(getByTestId('currentEditStep')).toHaveTextContent(
      EditRequestStepsEnum.Edit,
    );
    expect(getByTestId('percentCompleteEdit')).toHaveTextContent('66');
  });

  it('renders children correctly', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Test Children')).toBeInTheDocument();
  });
});
