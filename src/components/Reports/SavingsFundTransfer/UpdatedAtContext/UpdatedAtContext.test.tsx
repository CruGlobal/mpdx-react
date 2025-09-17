import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { UpdatedAtProvider, useUpdatedAtContext } from './UpdateAtContext';

const mutationSpy = jest.fn();

const date = new Date('2024-06-03T12:00:00Z');
const spy = jest.spyOn(Date, 'now').mockReturnValue(date.getTime());

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <GqlMockedProvider onCall={mutationSpy}>
        <UpdatedAtProvider>{<div>Test Children</div>}</UpdatedAtProvider>
      </GqlMockedProvider>
    </LocalizationProvider>
  </ThemeProvider>
);

function FailedConsumer() {
  const context = useUpdatedAtContext();
  return <div>{JSON.stringify(context)}</div>;
}

function TestConsumer() {
  const { setUpdatedAt } = useUpdatedAtContext();
  return (
    <div>
      <p>Updated At: {date?.toString()}</p>
      <button onClick={setUpdatedAt}>Update</button>
    </div>
  );
}

describe('UpdatedAtContext', () => {
  it('throws an error if used outside of a provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FailedConsumer />)).toThrow(
      /Could not find UpdatedAtContext/i,
    );
    spy.mockRestore();
  });

  it('sets updatedAt value when button clicked', async () => {
    const { getByText, getByRole } = render(
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <GqlMockedProvider onCall={mutationSpy}>
            <UpdatedAtProvider>
              <TestConsumer />
            </UpdatedAtProvider>
          </GqlMockedProvider>
        </LocalizationProvider>
      </ThemeProvider>,
    );

    expect(getByText(/Updated At:/i)).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Update' }));
    expect(getByText(/Updated At:/i)).toHaveTextContent(
      `Updated At: ${date.toString()}`,
    );

    spy.mockRestore();
  });

  it('should render children', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Test Children')).toBeInTheDocument();
  });
});
