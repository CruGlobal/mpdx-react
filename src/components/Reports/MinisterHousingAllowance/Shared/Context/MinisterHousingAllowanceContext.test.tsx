import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
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
    currentIndex,
    handleNextStep,
    handlePreviousStep,
    percentComplete,
  } = useMinisterHousingAllowance();

  return (
    <div>
      <div data-testid="steps">{steps.length}</div>
      <div data-testid="percentComplete">{percentComplete}</div>

      <div data-testid="currentIndex">{currentIndex}</div>
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
    const { findByTestId, getByTestId, getByRole } = render(<TestComponent />);

    expect(await findByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentIndex')).toHaveTextContent('0');
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('1');
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('3');
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    await userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');
  });

  it('provides initial state for edit page', async () => {
    const { findByTestId, getByTestId, getByRole } = render(
      <TestComponent type={PageEnum.Edit} />,
    );

    expect(await findByTestId('steps')).toHaveTextContent('4');
    expect(getByTestId('currentIndex')).toHaveTextContent('0');
    expect(getByTestId('percentComplete')).toHaveTextContent('25');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('1');
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole('button', { name: 'Next' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('3');
    expect(getByTestId('percentComplete')).toHaveTextContent('100');

    await userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('2');
    expect(getByTestId('percentComplete')).toHaveTextContent('75');

    await userEvent.click(getByRole('button', { name: 'Previous' }));
    expect(getByTestId('currentIndex')).toHaveTextContent('1');
    expect(getByTestId('percentComplete')).toHaveTextContent('50');

    await userEvent.click(getByRole('button', { name: 'Previous' }));
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
});
