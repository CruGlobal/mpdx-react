import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { getTopBarMultipleMock } from '../../TopBar/TopBar.mock';
import { NavTools } from './NavTools';

jest.mock('src/components/Setup/SetupProvider');

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
  push: jest.fn(),
};

const TestComponent = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider mocks={[getTopBarMultipleMock()]} addTypename={false}>
        <NavTools />
      </MockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NavTools', () => {
  it('default', async () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: false,
    });

    const { findByText, getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('NavTools')).toBeInTheDocument();
    expect(getByText('Add')).toBeInTheDocument();
    expect(await findByText('John Smith')).toBeInTheDocument();
  });

  it('hides links during the setup tour', async () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: true,
    });

    const { queryByText, getByTestId } = render(<TestComponent />);

    expect(getByTestId('NavTools')).toBeInTheDocument();
    expect(queryByText('Add')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText('John Smith')).not.toBeInTheDocument(),
    );
  });
});
