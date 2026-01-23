import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import {
  MinisterHousingAllowanceProvider,
  useMinisterHousingAllowance,
} from './MinisterHousingAllowanceContext';

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

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
    currentIndex,
    handleNextStep,
    handlePreviousStep,
    percentComplete,
    trackMutation,
    isMutating,
  } = useMinisterHousingAllowance();

  return (
    <div>
      <div data-testid="steps">{steps.length}</div>
      <div data-testid="percentComplete">{percentComplete}</div>

      <div data-testid="currentIndex">{currentIndex}</div>
      <button onClick={handleNextStep}>Next</button>
      <button onClick={handlePreviousStep}>Previous</button>

      <button onClick={() => trackMutation(sleep(100))}>Start mutation</button>
      <button onClick={() => trackMutation(sleep(5000))}>
        Start slow mutation
      </button>
      <p data-testid="mutating-status">
        {isMutating ? 'Mutating' : 'Not mutating'}
      </p>
    </div>
  );
}

describe('MinisterHousingAllowanceContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  it('throws an error when used outside of the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find MinisterHousingAllowanceContext/i,
    );
    spy.mockRestore();
  });

  it('provides initial state for new page', async () => {
    const { findByTestId, getByTestId, getByRole } = render(<TestComponent />);

    expect(await findByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentIndex')).toHaveTextContent('0');
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('1');
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('3');
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');
  });

  it('provides initial state for edit page', async () => {
    const { findByTestId, getByTestId, getByRole } = render(
      <TestComponent type={PageEnum.Edit} />,
    );

    expect(await findByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentIndex')).toHaveTextContent('1');
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('3');
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('1');
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('0');
    expect(getByTestId('percentComplete')).toHaveTextContent('25');
  });

  it('renders children correctly', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('button', { name: 'Previous' }),
    ).toBeInTheDocument();
    expect(getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('should track pending mutations', async () => {
    const { getByTestId, getByRole } = render(<TestComponent />);

    userEvent.click(getByRole('button', { name: 'Start mutation' }));
    userEvent.click(getByRole('button', { name: 'Start slow mutation' }));
    expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

    jest.advanceTimersByTime(500);
    expect(getByTestId('mutating-status')).toHaveTextContent('Mutating');

    jest.advanceTimersByTime(10000);
    await waitFor(() =>
      expect(getByTestId('mutating-status')).toHaveTextContent('Not mutating'),
    );
  });
});
