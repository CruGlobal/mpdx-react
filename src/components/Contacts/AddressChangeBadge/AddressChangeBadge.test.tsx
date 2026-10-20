import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetUserQuery } from 'src/components/User/GetUser.generated';
import theme from 'src/theme';
import { AddressChangeBadge } from './AddressChangeBadge';

const currentUserId = 'user-1';

const addressChange = {
  id: 'address-1',
  startDate: '2026-08-03',
  createdAt: '2026-01-01T00:00:00Z',
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
  it.each([
    ['by you', { createdByUser: { id: currentUserId } }],
    ['other user', { createdByUser: { id: 'user-2' } }],
    ['unknown user', {}],
    ['automatic', { source: 'Siebel' }],
  ])('labels the change as %s', async (madeBy, overrides) => {
    const { findByText } = renderBadge(overrides);

    expect(
      await findByText(`Address changed Aug 3 · ${madeBy}`),
    ).toBeInTheDocument();
  });

  it('uses the created date when there is no start date', async () => {
    const { findByText } = renderBadge({
      startDate: null,
      createdAt: '2026-03-02T12:00:00Z',
    });

    expect(
      await findByText('Address changed Mar 2 · unknown user'),
    ).toBeInTheDocument();
  });
});
