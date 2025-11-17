import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { getByRole, render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { PageEnum, StepsEnum } from '../sharedTypes';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from './MinisterHousingAllowanceContext';

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
  } = useMinisterHousingAllowance();

  return (
    <div>
      <div data-testid="steps">{steps.length}</div>
      <div data-testid="percentComplete">{percentComplete}</div>

      <div data-testid="currentStep">{currentStep}</div>
      <button onClick={handleNextStep}>Next</button>
      <button onClick={handlePreviousStep}>Previous</button>
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
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.AboutForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    await userEvent.click(getByRole(document.body, 'button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.RentOrOwn);
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole(document.body, 'button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole(document.body, 'button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.Receipt);
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Previous' }),
    );
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');
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

    expect(getByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.AboutForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    await userEvent.click(getByRole(document.body, 'button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.RentOrOwn);
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole(document.body, 'button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole(document.body, 'button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.Receipt);
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    await userEvent.click(
      getByRole(document.body, 'button', { name: 'Previous' }),
    );
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');
  });

  it('renders children correctly', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Test Children')).toBeInTheDocument();
  });
});
