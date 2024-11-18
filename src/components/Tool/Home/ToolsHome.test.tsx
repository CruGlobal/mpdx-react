import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import theme from '../../../theme';
import ToolsHome from './ToolsHome';
import { ToolsListHome } from './ToolsListHome';

const accountListId = 'account-list-1';

const mocks = {
  GetToolNotifications: {
    fixCommitmentInfo: { totalCount: 2 },
    fixMailingAddresses: { totalCount: 2 },
    fixSendNewsletter: { totalCount: 2 },
    fixEmailAddresses: { totalCount: 4 },
    fixPhoneNumbers: { totalCount: 4 },
    mergeContacts: { totalCount: 6 },
    mergePeople: { totalCount: 100 },
  },
};

interface TestComponentProps {
  setup?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({ setup = false }) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider<{
      GetToolNotifications: GetToolNotificationsQuery;
    }>
      mocks={mocks}
    >
      <TestRouter
        router={{
          query: { accountListId },
          isReady: true,
        }}
      >
        <ToolsHome onSetupTour={setup} />
      </TestRouter>
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('ToolHome', () => {
  it('default', () => {
    const { getByTestId, queryByText } = render(<TestComponent />);

    expect(getByTestId('Home')).toBeInTheDocument();
    ToolsListHome.forEach((tool) => {
      expect(queryByText(tool.tool)).toBeInTheDocument();
      expect(queryByText(tool.desc)).toBeInTheDocument();
    });
  });

  it('renders notifications', async () => {
    const { findAllByText } = render(<TestComponent />);

    const contacts = await findAllByText('2');
    expect(contacts).toHaveLength(3);

    const people = await findAllByText('4');
    expect(people).toHaveLength(2);

    const contactDuplicates = await findAllByText('6');
    expect(contactDuplicates).toHaveLength(1);

    const personDuplicates = await findAllByText('99+');
    expect(personDuplicates).toHaveLength(1);
  });

  it('does not show notifications when on Setup Tour', async () => {
    const { queryByText } = render(<TestComponent setup={true} />);
    await waitFor(() => {
      expect(queryByText('2')).not.toBeInTheDocument();
      expect(queryByText('6')).not.toBeInTheDocument();
      expect(queryByText('9+')).not.toBeInTheDocument();
    });
  });
});
