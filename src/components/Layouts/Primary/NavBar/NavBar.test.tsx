import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { useSetupContext } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import { getTopBarMultipleMock } from '../TopBar/TopBar.mock';
import { NavBar } from './NavBar';

jest.mock('src/components/Setup/SetupProvider');

const router = {
  query: { accountListId: 'abc' },
  isReady: true,
  push: jest.fn(),
};

interface TestComponentProps {
  openMobile?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  openMobile = false,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider mocks={mocks} addTypename={false}>
        <NavBar onMobileClose={onMobileClose} openMobile={openMobile} />
      </MockedProvider>
    </TestRouter>
  </ThemeProvider>
);

const onMobileClose = jest.fn();
const mocks = [getTopBarMultipleMock()];

describe('NavBar', () => {
  beforeEach(() => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: false,
    });
  });

  it('default', () => {
    const { queryByTestId } = render(<TestComponent />);

    expect(queryByTestId('NavBarDrawer')).not.toBeInTheDocument();
  });

  it('opened', () => {
    const { getAllByRole, queryByTestId } = render(
      <TestComponent openMobile />,
    );

    expect(queryByTestId('NavBarDrawer')).toBeInTheDocument();
    expect(
      getAllByRole('button', { name: 'Dashboard' })[0],
    ).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    (useSetupContext as jest.MockedFn<typeof useSetupContext>).mockReturnValue({
      onSetupTour: true,
    });

    const { queryByRole } = render(<TestComponent openMobile />);

    expect(
      queryByRole('button', { name: 'Dashboard' }),
    ).not.toBeInTheDocument();
  });
});
