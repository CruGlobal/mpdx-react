import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Settings } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import { AddressChangeBadge } from './AddressChangeBadge';

const currentUserId = 'user-1';

const addressChange = {
  id: 'change-1',
  date: '2026-08-03',
  source: 'MPDX',
  createdByUser: null,
};

const renderBadge = (overrides = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <GqlMockedProvider<{ GetUser: GetUserQuery }>
        mocks={{ GetUser: { user: { id: currentUserId } } }}
      >
        <AddressChangeBadge
          addressChange={{ ...addressChange, ...overrides }}
        />
      </GqlMockedProvider>
    </ThemeProvider>,
  );

describe('AddressChangeBadge', () => {
  const nowMillis = Settings.now;
  beforeEach(() => {
    Settings.now = () => new Date(2026, 9, 21).valueOf();
  });
  afterEach(() => {
    Settings.now = nowMillis;
  });

  it.each([
    ['by you', { createdByUser: { id: currentUserId } }],
    ['other user', { createdByUser: { id: 'user-2' } }],
    ['in MPDX', {}],
    ['automatic', { source: 'Siebel' }],
  ])('labels the change as %s', async (madeBy, overrides) => {
    const { findByText } = renderBadge(overrides);

    expect(
      await findByText(`Address changed Aug 3 · ${madeBy}`),
    ).toBeInTheDocument();
  });

  it('shows the year for a change before this year', async () => {
    const { findByText } = renderBadge({ date: '2024-06-13' });

    expect(
      await findByText('Address changed Jun 13, 2024 · in MPDX'),
    ).toBeInTheDocument();
  });
});
