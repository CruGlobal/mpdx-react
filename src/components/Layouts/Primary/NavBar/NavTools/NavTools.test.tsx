import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { getTopBarMultipleMock } from '../../TopBar/TopBar.mock';
import { NavTools } from './NavTools';

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
  push: jest.fn(),
};

interface TestComponentProps {
  onSetupTour?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ onSetupTour }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider mocks={[getTopBarMultipleMock()]} addTypename={false}>
        <TestSetupProvider onSetupTour={onSetupTour}>
          <NavTools />
        </TestSetupProvider>
      </MockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('NavTools', () => {
  it('default', async () => {
    const { findByText, getByTestId, getByText } = render(<TestComponent />);

    expect(getByTestId('NavTools')).toBeInTheDocument();
    expect(getByText('Add')).toBeInTheDocument();
    expect(await findByText('John Smith')).toBeInTheDocument();
  });

  it('hides links during the setup tour', async () => {
    const { queryByText, getByTestId } = render(<TestComponent onSetupTour />);

    expect(getByTestId('NavTools')).toBeInTheDocument();
    expect(queryByText('Add')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(queryByText('John Smith')).not.toBeInTheDocument(),
    );
  });
});
