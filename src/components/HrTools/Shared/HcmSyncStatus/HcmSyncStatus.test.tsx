import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { DateTime, Settings } from 'luxon';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { HcmSyncStatus } from './HcmSyncStatus';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

const now = DateTime.fromISO('2026-09-30T15:00:00Z');

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

const TestComponent: React.FC<TestComponentProps> = ({
  syncedAt = '2026-09-30T12:00:00Z',
  outOfSync = false,
  personNumber,
  refreshError,
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider
      mocks={{
        Hcm: { hcm: [{ syncedAt, outOfSync }] },
        RefreshHcm: refreshError
          ? {
              refreshHcm: () => {
                throw errors[refreshError];
              },
            }
          : { refreshHcm: { hcm: [{ syncedAt: now.toISO(), outOfSync }] } },
      }}
      onCall={mutationSpy}
    >
      <HcmSyncStatus personNumber={personNumber} />
    </GqlMockedProvider>
  </ThemeProvider>
);

describe('HcmSyncStatus', () => {
  beforeEach(() => {
    Settings.now = () => now.toMillis();
  });

  afterEach(() => {
    Settings.now = () => Date.now();
  });

  it('shows how long ago the data was synced from HCM', async () => {
    const { findByText, queryByRole } = render(<TestComponent />);

    expect(await findByText('Synced from HCM 3 hours ago')).toBeInTheDocument();
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the exact sync time on hover', async () => {
    const { findByText, findByRole } = render(<TestComponent />);

    userEvent.hover(await findByText('Synced from HCM 3 hours ago'));

    expect(await findByRole('tooltip')).toHaveTextContent('Sep 30, 2026');
  });

  it('marks data the sync has not reached in over a day', async () => {
    const { findByText } = render(
      <TestComponent syncedAt="2026-09-28T12:00:00Z" />,
    );

    expect(await findByText('Synced from HCM 2 days ago')).toHaveStyle({
      color: theme.palette.warning.dark,
    });
  });

  it('warns when HCM no longer has a record for the person', async () => {
    const { findByRole } = render(<TestComponent outOfSync />);

    const alert = await findByRole('alert');
    expect(alert).toHaveTextContent(
      'HCM no longer has a record for this person',
    );
    expect(alert).toHaveTextContent(
      'The information below is from Sep 30, 2026',
    );
  });

  it('leaves out the sync time when there is none', async () => {
    const { findByRole, queryByText } = render(
      <TestComponent syncedAt={null} />,
    );

    expect(await findByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(queryByText(/Synced from HCM/)).not.toBeInTheDocument();
  });

  it('refreshes the person shown, reloads the page data, and waits out the cooldown', async () => {
    const { findByRole } = render(<TestComponent personNumber="000123456" />);

    const button = await findByRole('button', { name: 'Refresh' });
    userEvent.click(button);

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('RefreshHcm', {
        personNumber: '000123456',
      }),
    );
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('HCM data refreshed.', {
        variant: 'success',
      }),
    );
    expect(
      mutationSpy.mock.calls.filter(
        ([{ operation }]) => operation.operationName === 'Hcm',
      ),
    ).toHaveLength(2);
    expect(await findByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('waits out the cooldown when the API says the person was just refreshed', async () => {
    const { findByRole } = render(<TestComponent refreshError="rateLimited" />);

    userEvent.click(await findByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'HCM data can be refreshed once every 3 minutes',
        { variant: 'info' },
      ),
    );
    expect(await findByRole('button', { name: 'Refresh' })).toBeDisabled();
  });

  it('lets the user try again right away when HCM is unavailable', async () => {
    const { findByRole } = render(<TestComponent refreshError="unavailable" />);

    userEvent.click(await findByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'HCM UserInfo report unavailable',
        { variant: 'error' },
      ),
    );
    expect(await findByRole('button', { name: 'Refresh' })).toBeEnabled();
  });
});
