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
    expect(getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('hides links during the setup tour', () => {
    const { queryByRole } = render(<TestComponent openMobile onSetupTour />);

    expect(queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
  });

  describe("What's New link", () => {
    it('is visible when HELP_WHATS_NEW_URL is set', () => {
      process.env.HELP_WHATS_NEW_URL = '/new';
      process.env.HELP_WHATS_NEW_IMAGE_URL = '/img.png';

      const { getByRole } = render(<TestComponent openMobile />);

      expect(
        getByRole('link', { name: "Help logo What's New" }),
      ).toHaveAttribute('href', '/new');
    });

    it('is hidden when HELP_WHATS_NEW_URL is not set', () => {
      process.env.HELP_WHATS_NEW_URL = '';

      const { queryByRole } = render(<TestComponent openMobile />);

      expect(
        queryByRole('link', { name: "Help logo What's New" }),
      ).not.toBeInTheDocument();
    });
  });
});
