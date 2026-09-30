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
  refreshError?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  syncedAt = '2026-09-30T12:00:00Z',
  outOfSync = false,
  personNumber,
  refreshError = false,
}) => (
  <ThemeProvider theme={theme}>
    <GqlMockedProvider
      mocks={{
        Hcm: { hcm: [{ syncedAt, outOfSync }] },
        RefreshHcm: refreshError
          ? {
              refreshHcm: () => {
                throw new GraphQLError(
                  'HCM data can be refreshed once every 3 minutes',
                  { extensions: { code: 'HCM_REFRESH_RATE_LIMITED' } },
                );
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

  it('shows how long ago the data was read from HCM', async () => {
    const { findByText, queryByRole } = render(<TestComponent />);

    expect(
      await findByText('HCM data updated 3 hours ago'),
    ).toBeInTheDocument();
    expect(queryByRole('alert')).not.toBeInTheDocument();
  });

  it('warns when HCM no longer has a record for the person', async () => {
    const { findByRole } = render(<TestComponent outOfSync />);

    expect(await findByRole('alert')).toHaveTextContent(
      'HCM no longer has a record for this person',
    );
  });

  it('leaves out the updated time when there is none', async () => {
    const { findByRole, queryByText } = render(
      <TestComponent syncedAt={null} />,
    );

    expect(await findByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(queryByText(/HCM data updated/)).not.toBeInTheDocument();
  });

  it('refreshes the person shown and reloads the page data', async () => {
    const { findByRole } = render(<TestComponent personNumber="000123456" />);

    userEvent.click(await findByRole('button', { name: 'Refresh' }));

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
  });

  it('shows the error when a refresh is refused', async () => {
    const { findByRole } = render(<TestComponent refreshError />);

    userEvent.click(await findByRole('button', { name: 'Refresh' }));

    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith(
        'HCM data can be refreshed once every 3 minutes',
        { variant: 'error' },
      ),
    );
  });
});
