import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { ActionTypeEnum } from '../../mockData';
import { CalendarTypeProvider, useCalendarType } from './CalendarTypeContext';

const mutationSpy = jest.fn();
const type = ActionTypeEnum.Edit;

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <CalendarTypeProvider type={type}>
          {<div>Test Children</div>}
        </CalendarTypeProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

function FailedConsumer() {
  const context = useCalendarType();
  return <div>{context}</div>;
}

function TestConsumer() {
  const context = useCalendarType();
  return <div>{context}</div>;
}

describe('CalendarTypeContext', () => {
  it('throws an error when used outside of the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find CalendarTypeContext/i,
    );
    spy.mockRestore();
  });

  it('provides the correct context value', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <CalendarTypeProvider type={type}>
              <TestConsumer />
            </CalendarTypeProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );
    expect(getByText(`${type}`)).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test Children')).toBeInTheDocument();
  });
});
