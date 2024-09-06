import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { SetupProvider } from 'src/components/Setup/SetupProvider';
import theme from 'src/theme';
import ToolsPage from './tools.page';

const accountListId = 'account-list-1';

const push = jest.fn();

interface MocksProvidersProps {
  children: JSX.Element;
  setup?: string;
}

const MocksProviders: React.FC<MocksProvidersProps> = ({ children, setup }) => (
  <GqlMockedProvider>
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{
          query: { accountListId, setup },
          pathname: '/accountLists/[accountListId]/tools',
          isReady: true,
          push,
        }}
      >
        <SetupProvider>{children}</SetupProvider>
      </TestRouter>
    </ThemeProvider>
  </GqlMockedProvider>
);

describe('Tools Page', () => {
  it('should render page', async () => {
    const { findByText } = render(
      <MocksProviders>
        <ToolsPage />
      </MocksProviders>,
    );
    expect(await findByText('Tools')).toBeInTheDocument();
    expect(await findByText('Fix Phone Numbers')).toBeInTheDocument();
  });

  it('should expand the tools side nav', async () => {
    const { findByText, getByTestId, queryByText, queryByTestId } = render(
      <MocksProviders>
        <ToolsPage />
      </MocksProviders>,
    );

    await waitFor(() =>
      expect(queryByTestId('ToolsWrapperLoading')).not.toBeInTheDocument(),
    );

    const expandButton = getByTestId('ToolsMenuIcon');
    expect(expandButton).toBeInTheDocument();

    userEvent.click(expandButton);
    expect(await findByText('Imports')).toBeInTheDocument();

    const closeButton = getByTestId('ToolNavToggle');
    userEvent.click(closeButton);
    await waitFor(() => expect(queryByText('Imports')).not.toBeInTheDocument());
  });

  describe('Setup Tour', () => {
    const bannerText =
      'Select one of the highlighted tools below to begin importing your data.';

    it('should not show setup banner', async () => {
      const { queryByText, findByText } = render(
        <MocksProviders>
          <ToolsPage />
        </MocksProviders>,
      );

      expect(await findByText('Tools')).toBeInTheDocument();
      await waitFor(() => {
        expect(queryByText(bannerText)).not.toBeInTheDocument();
      });
    });

    it('should show setup banner move to the Dashboard', async () => {
      const { findByText, getByRole } = render(
        <MocksProviders setup="1">
          <ToolsPage />
        </MocksProviders>,
      );

      expect(await findByText(bannerText)).toBeInTheDocument();

      const skipButton = getByRole('button', { name: 'Skip Step' });
      userEvent.click(skipButton);

      // Move to Dashboard
      userEvent.click(skipButton);
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith('/accountLists/account-list-1');
      });
    });
  });
});
