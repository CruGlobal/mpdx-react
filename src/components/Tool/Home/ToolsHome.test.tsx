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
    // graphql-ergonomock doesn't handle renamed fields, so we have to mock
    // using the name of the field in the GraphQL schema, not the renamed field
    contacts: { totalCount: 2 },
    people: { totalCount: 4 },
    contactDuplicates: { totalCount: 6 },
    personDuplicates: { totalCount: 100 },
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
      // @ts-expect-error graphql-ergonomock does not handle renamed fields correctly, so
      // the mock field name doesn't match the query field name
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
