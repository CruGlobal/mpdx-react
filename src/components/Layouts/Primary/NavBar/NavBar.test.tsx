import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { getTopBarMultipleMock } from '../TopBar/TopBar.mock';
import { NavBar } from './NavBar';

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
  push: jest.fn(),
};

interface TestComponentProps {
  openMobile?: boolean;
  onSetupTour?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  openMobile = false,
  onSetupTour,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <TestSetupProvider onSetupTour={onSetupTour}>
          <NavBar onMobileClose={onMobileClose} openMobile={openMobile} />
        </TestSetupProvider>
      </MockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const onMobileClose = jest.fn();
const mocks = [getTopBarMultipleMock()];

describe('NavBar', () => {
  it('default', () => {
    const { queryByTestId } = render(<TestComponent />);

    expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument();
  });

  it('opened', () => {
    const { getByRole, queryByTestId } = render(<TestComponent openMobile />);

    expect(queryByTestId('NavBarDrawer')).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    const { queryByRole } = render(<TestComponent openMobile onSetupTour />);

    expect(
      queryByRole('menuitem', { name: 'Dashboard' }),
    ).not.toBeInTheDocument();
  });
});
