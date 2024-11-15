import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import theme from '../../../theme';
import NavToolList from './NavToolList';

const accountListId = 'account-list-22';

const toggleMock = jest.fn();

const router = {
  query: { accountListId },
  isReady: true,
};

const mocks = {
  GetToolNotifications: {
    fixCommitmentInfo: { totalCount: 2 },
    fixMailingAddresses: { totalCount: 2 },
    fixSendNewsletter: { totalCount: 2 },
    fixEmailAddresses: { totalCount: 4 },
    fixPhoneNumbers: { totalCount: 4 },
    mergeContacts: { totalCount: 6 },
    mergePeople: { totalCount: 10 },
  },
};

const TestComponent = () => (
  <TestRouter router={router}>
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{
        GetToolNotifications: GetToolNotificationsQuery;
      }>
        mocks={mocks}
      >
        <NavToolList toggle={toggleMock} isOpen={true} />
      </GqlMockedProvider>
    </ThemeProvider>
  </TestRouter>
);

describe('NavToolList', () => {
  it('default', () => {
    const { getByTestId } = render(<TestComponent />);

    expect(getByTestId('ToolNavList')).toBeInTheDocument();
  });
  it('toggles nav', async () => {
    const { getByTestId } = render(<TestComponent />);
    const toggleButton = getByTestId('ToolNavToggle');
    expect(toggleButton).toBeInTheDocument();
    userEvent.click(toggleButton);
    await waitFor(() => {
      expect(toggleMock).toHaveBeenCalledWith(false);
    });
  });
  it('renders main menu items', () => {
    const { getAllByTestId } = render(<TestComponent />);
    const listItems = getAllByTestId('ToolNavListItem');
    expect(listItems).toHaveLength(4);
  });
  it('renders notifications', async () => {
    const { getByTestId, findByTestId } = render(<TestComponent />);
    expect(getByTestId('ToolNavList')).toBeInTheDocument();
    expect(getByTestId('fixCommitmentInfo-list-item')).toBeInTheDocument();

    expect(
      await findByTestId('fixCommitmentInfo-notifications'),
    ).toHaveTextContent('2');

    expect(
      await findByTestId('fixMailingAddresses-notifications'),
    ).toHaveTextContent('2');

    expect(
      await findByTestId('fixSendNewsletter-notifications'),
    ).toHaveTextContent('2');

    expect(
      await findByTestId('fixEmailAddresses-notifications'),
    ).toHaveTextContent('4');

    expect(
      await findByTestId('fixPhoneNumbers-notifications'),
    ).toHaveTextContent('4');

    expect(await findByTestId('mergeContacts-notifications')).toHaveTextContent(
      '6',
    );

    expect(await findByTestId('mergePeople-notifications')).toHaveTextContent(
      '9+',
    );
  });
});
