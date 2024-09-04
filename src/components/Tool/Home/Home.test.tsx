import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import theme from '../../../theme';
import Home from './Home';
import { ToolsListHome } from './ToolsListHome';

const accountListId = 'account-list-1';

const router = {
  query: { accountListId },
  isReady: true,
};

const mocks = {
  GetToolNotifications: {
    // graphql-ergonomock doesn't handle renamed fields, so we have to mock
    // using the name of the field in the GraphQL schema, not the renamed field
    contacts: { totalCount: 2 },
    people: { totalCount: 4 },
    contactDuplicates: { totalCount: 6 },
    personDuplicates: { totalCount: 10 },
  },
};

describe('ToolHome', () => {
  it('default', () => {
    const { getByTestId, queryByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetToolNotifications: GetToolNotificationsQuery;
        }>
          mocks={mocks}
        >
          <TestRouter router={router}>
            <Home />
          </TestRouter>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    expect(getByTestId('Home')).toBeInTheDocument();
    ToolsListHome.forEach((tool) => {
      expect(queryByText(tool.tool)).toBeInTheDocument();
      expect(queryByText(tool.desc)).toBeInTheDocument();
    });
  });

  it('renders notifications', async () => {
    const { findAllByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          GetToolNotifications: GetToolNotificationsQuery;
        }>
          mocks={mocks}
        >
          <TestRouter router={router}>
            <Home />
          </TestRouter>
        </GqlMockedProvider>
      </ThemeProvider>,
    );

    const contacts = await findAllByText('2');
    expect(contacts).toHaveLength(3);

    const people = await findAllByText('4');
    expect(people).toHaveLength(2);

    const contactDuplicates = await findAllByText('6');
    expect(contactDuplicates).toHaveLength(1);

    const personDuplicates = await findAllByText('9+');
    expect(personDuplicates).toHaveLength(1);
  });
});
