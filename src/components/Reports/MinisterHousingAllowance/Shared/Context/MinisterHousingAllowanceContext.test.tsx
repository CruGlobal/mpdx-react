import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { StepsEnum } from '../sharedTypes';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from './MinisterHousingAllowanceContext';

interface TestComponentProps {
  type?: PageEnum;
}
const TestComponent: React.FC<TestComponentProps> = ({
  type = PageEnum.New,
}) => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider>
        <MinisterHousingAllowanceProvider type={type}>
          <TestConsumer />
        </MinisterHousingAllowanceProvider>
      </GqlMockedProvider>
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
    const { getByTestId, getByRole } = render(<TestComponent />);

    expect(getByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.AboutForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.RentOrOwn);
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.Receipt);
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    await userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');
  });

  it('provides initial state for edit page', async () => {
    const { getByTestId, getByRole } = render(
      <TestComponent type={PageEnum.Edit} />,
    );

    expect(getByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.AboutForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.RentOrOwn);
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.Receipt);
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    await userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentStep')).toHaveTextContent(StepsEnum.CalcForm);
    expect(getByTestId('percentComplete')).toHaveTextContent('75');
  });

  it('renders children correctly', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });
});
