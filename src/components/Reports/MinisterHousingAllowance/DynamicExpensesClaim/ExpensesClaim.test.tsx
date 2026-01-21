import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import {
  ContextType,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { ExpensesClaim } from './ExpensesClaim';

const setIsRightPanelOpen = jest.fn();

interface TestComponentProps {
  contextValue?: Partial<ContextType>;
}

const TestComponent: React.FC<TestComponentProps> = ({ contextValue }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider>
      <MinisterHousingAllowanceContext.Provider
        value={contextValue as ContextType}
      >
        <ExpensesClaim />
      </MinisterHousingAllowanceContext.Provider>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('ExpensesClaim', () => {
  it('renders component', () => {
    const { getByText, getByTestId } = render(
      <TestComponent contextValue={{ setIsRightPanelOpen }} />,
    );

    expect(
      getByText('What expenses can I claim on my MHA?'),
    ).toBeInTheDocument();
    expect(getByTestId('CloseIcon')).toBeInTheDocument();
    expect(getByText('Allowable Expenses for MHA')).toBeInTheDocument();
  });

  it('closes the panel when close icon is clicked', async () => {
    const { getByTestId } = render(
      <TestComponent contextValue={{ setIsRightPanelOpen }} />,
    );

    const closeIcon = getByTestId('CloseIcon');
    userEvent.click(closeIcon);

    expect(setIsRightPanelOpen).toHaveBeenCalledWith(false);
  });
});
