import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import AccountLists from '.';

describe('AccountLists', () => {
  it('has correct defaults', () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <AccountLists
          data={{
            accountLists: {
              nodes: [
                {
                  id: 'abc',
                  name: 'My Personal Staff Account',
                  monthlyGoal: 100,
                  receivedPledges: 10,
                  totalPledges: 20,
                  currency: 'USD',
                },
                {
                  id: 'def',
                  name: 'My Ministry Account',
                  monthlyGoal: null,
                  receivedPledges: 10,
                  totalPledges: 20,
                  currency: 'USD',
                },
                {
                  id: 'ghi',
                  name: "My Friend's Staff Account",
                  monthlyGoal: 100,
                  receivedPledges: 0,
                  totalPledges: 0,
                  currency: 'USD',
                },
              ],
            },
          }}
        />
      </ThemeProvider>,
    );
    expect(getByTestId('abc')).toHaveTextContent('My Personal Staff Account');
    expect(getByTestId('def')).toHaveTextContent('My Ministry Account');
    expect(getByTestId('ghi')).toHaveTextContent("My Friend's Staff Account");
  });
});
