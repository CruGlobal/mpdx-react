import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { DateTime, Settings } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HcmSyncBodyStatus, HcmSyncHeaderStatus } from './HcmSyncStatus';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const now = DateTime.fromISO('2026-09-30T15:00:00Z');
const refreshedAt = now.minus({ minutes: 1 }).toISO();

interface TestComponentProps {
  syncedAt?: string | null;
  outOfSync?: boolean;
  personNumber?: string;
  refreshError?: 'rateLimited' | 'unavailable';
}

const errors = {
  rateLimited: new GraphQLError(
    'HCM data can be refreshed once every 3 minutes',
    { extensions: { code: 'HCM_REFRESH_RATE_LIMITED' } },
  ),
  unavailable: new GraphQLError('HCM UserInfo report unavailable', {
    extensions: { code: 'HCM_UNAVAILABLE' },
  }),
};

// Rendered the way a page does: one piece in the header, one under it. Which one shows at which
// width is CSS media queries, which jsdom does not apply faithfully, so that is checked by eye.
const TestComponent: React.FC<TestComponentProps> = ({
  syncedAt = '2026-09-30T12:00:00Z',
  outOfSync = false,
  personNumber,
  refreshError,
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider
      mocks={{
        Hcm: {
          // A refresh comes back synced just now, so tests can see it replace the page's read.
          hcm: (_parent: unknown, args: { refresh?: boolean }) => {
            if (args.refresh && refreshError) {
              throw errors[refreshError];
            }
            return [
              { syncedAt: args.refresh ? refreshedAt : syncedAt, outOfSync },
            ];
          },
        },
      }}
      onCall={mutationSpy}
    >
      <>
        <HcmSyncHeaderStatus personNumber={personNumber} />
        <HcmSyncBodyStatus personNumber={personNumber} />
      </>
    </GqlMockedProvider>
  </ThemeProvider>
);

const renderBody = async (props: TestComponentProps = {}) => {
  const result = render(<TestComponent {...props} />);
  const body = within(await result.findByTestId('HcmSyncBodyStatus'));
  return { ...result, body };
};

describe('HcmSyncStatus', () => {
  beforeEach(() => {
    Settings.now = () => now.toMillis();
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('renders the sync time for the header and for under it on narrow screens', async () => {
    const { findByTestId, body } = await renderBody();

    const header = await findByTestId('HcmSyncHeaderStatus');
    expect(header).toHaveTextContent('Synced from HCM 3 hr. ago');
    expect(body.getByText('Synced from HCM 3 hr. ago')).toBeInTheDocument();
    expect(body.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the exact sync time on hover', async () => {
    const { findByRole, body } = await renderBody();

    userEvent.hover(body.getByText('Synced from HCM 3 hr. ago'));

    expect(await findByRole('tooltip')).toHaveTextContent('Sep 30, 2026');
  });

  it('marks data the sync has not reached in over a day', async () => {
    const { body } = await renderBody({ syncedAt: '2026-09-28T12:00:00Z' });

    expect(body.getByText('Synced from HCM 2 days ago')).toHaveStyle({
      color: theme.palette.warning.dark,
    });
  });

  it('warns under the header when HCM no longer has a record for the person', async () => {
    const { body } = await renderBody({ outOfSync: true });

    const alert = body.getByRole('alert');
    expect(alert).toHaveTextContent(
      'HCM no longer has a record for this person',
    );
    expect(alert).toHaveTextContent(
      'The information below is from Sep 30, 2026',
    );
  });

  it('leaves out the sync time when there is none', async () => {
    const { body } = await renderBody({ syncedAt: null });

    expect(body.getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(body.queryByText(/Synced from HCM/)).not.toBeInTheDocument();
  });

  it('refreshes through the page Hcm query and replaces what the page shows', async () => {
    const { body, findByTestId } = await renderBody({
      personNumber: '000123456',
    });

    userEvent.click(body.getByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('Hcm', {
        personNumber: '000123456',
        refresh: true,
      }),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('HCM data refreshed.', {
        variant: 'success',
      }),
    );
    // The page's read (no refresh argument) shows the refreshed answer, with no second request.
    expect(await findByTestId('HcmSyncHeaderStatus')).toHaveTextContent(
      'Synced from HCM 1 min. ago',
    );
    expect(body.getByText('Synced from HCM 1 min. ago')).toBeInTheDocument();
    expect(
      mutationSpy.mock.calls.filter(
        ([{ operation }]) =>
          operation.operationName === 'Hcm' && !operation.variables.refresh,
      ),
    ).toHaveLength(1);
    expect(await body.findByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('waits out the cooldown when the API says the person was just refreshed', async () => {
    const { body } = await renderBody({ refreshError: 'rateLimited' });

    userEvent.click(body.getByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'HCM data can be refreshed once every 3 minutes',
        { variant: 'info' },
      ),
    );
    expect(await body.findByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('keeps the global error toast quiet for the errors it explains itself', async () => {
    const { body } = await renderBody({ refreshError: 'rateLimited' });

    userEvent.click(body.getByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('Hcm', { refresh: true }),
    );
    const refreshCall = mutationSpy.mock.calls.find(
      ([{ operation }]) => operation.variables.refresh,
    );
    expect(refreshCall?.[0].operation.getContext().suppressErrorCodes).toEqual([
      'HCM_REFRESH_RATE_LIMITED',
      'HCM_UNAVAILABLE',
    ]);
  });

  it('lets the user try again right away when HCM is unavailable', async () => {
    const { body } = await renderBody({ refreshError: 'unavailable' });

    userEvent.click(body.getByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'HCM UserInfo report unavailable',
        { variant: 'error' },
      ),
    );
    expect(body.getByRole('button', { name: 'Refresh' })).toBeEnabled();
  });
});
