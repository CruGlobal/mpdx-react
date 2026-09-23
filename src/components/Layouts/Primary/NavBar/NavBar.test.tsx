import React from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { TestSetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import {
  CoachingListCountDocument,
  CoachingListCountQuery,
} from '../CoachingListCount.generated';
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
  coachingCount?: number;
}

const coachingListCountResult = jest.fn();

const coachingListCountMock = (totalCount: number): MockedResponse => {
  const data: CoachingListCountQuery = {
    coachingAccountLists: { totalCount },
  };
  coachingListCountResult.mockReturnValue({ data });
  return {
    request: { query: CoachingListCountDocument },
    result: coachingListCountResult,
  };
};

const TestComponent: React.FC<TestComponentProps> = ({
  openMobile = false,
  onSetupTour,
  coachingCount = 0,
}) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <MockedProvider
        mocks={[...mocks, coachingListCountMock(coachingCount)]}
        addTypename={false}
      >
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

  it('shows the Coaching link when the user coaches account lists', async () => {
    const { findByRole } = render(
      <TestComponent openMobile coachingCount={2} />,
    );

    expect(await findByRole('link', { name: 'Coaching' })).toBeInTheDocument();
  });

  it('hides the Coaching link when the user coaches no account lists', async () => {
    const { findByRole, queryByRole } = render(
      <TestComponent openMobile coachingCount={0} />,
    );

    await findByRole('link', { name: 'Dashboard' });
    await waitFor(() => expect(coachingListCountResult).toHaveBeenCalled());
    expect(queryByRole('link', { name: 'Coaching' })).not.toBeInTheDocument();
  });
});
