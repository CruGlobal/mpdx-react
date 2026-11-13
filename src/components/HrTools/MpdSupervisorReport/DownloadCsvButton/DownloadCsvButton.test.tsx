import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { buildURI } from 'react-csv/lib/core';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { ManagedStaffQuery } from '../ManagedStaff.generated';
import {
  MpdSupervisorReportProvider,
  useMpdSupervisorReport,
} from '../MpdSupervisorReportContext';
import {
  managedStaffMember,
  managedStaffMock,
} from '../mpdSupervisorReportMocks';
import { DownloadCsvButton } from './DownloadCsvButton';

// Shows when the report has settled, so a disabled button is not just the
// loading state
const Settled: React.FC = () => {
  const { staffLoading, filterRequired, loadMoreError } =
    useMpdSupervisorReport();
  if (loadMoreError) {
    return <span>page failed</span>;
  }
  return staffLoading && !filterRequired ? null : <span>settled</span>;
};

// Stands in for the header's search box
const SearchProbe: React.FC = () => {
  const { setSearch, refetchStaff, staffError, filterRequired } =
    useMpdSupervisorReport();
  return (
    <>
      <button onClick={() => setSearch('Jones')}>Search Jones</button>
      <button onClick={refetchStaff}>Refresh</button>
      {staffError && <span>refresh failed</span>}
      {filterRequired && <span>filter required</span>}
    </>
  );
};

// Each file gets its own URL, so a test can tell the old file from the new one
jest.mock('react-csv/lib/core', () => ({
  buildURI: jest.fn((rows: unknown[]) => `blob:${rows.length - 1}-rows`),
}));

const alice = managedStaffMember({
  firstName: 'Alice',
  lastName: 'Jones',
  personNumber: '10000003',
  staffAccountId: '1000000003',
});

// Searching by name narrows the rows, as the API does
const searchableStaff: ApolloErgonoMockMap = {
  ManagedStaff: {
    managedStaff: (_root: unknown, args: { name?: string | null }) =>
      managedStaffMock(args.name ? [alice] : [managedStaffMember(), alice])
        .managedStaff,
  },
};

const renderButton = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
          mocks={{ ...searchableStaff, ...mocks }}
        >
          <MpdSupervisorReportProvider>
            <DownloadCsvButton />
            <Settled />
            <SearchProbe />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

describe('DownloadCsvButton', () => {
  it('links to a dated CSV of the loaded rows', async () => {
    const { findByRole } = renderButton();

    const link = await findByRole('link', { name: 'Download CSV' });
    expect(link).toHaveAttribute('href', 'blob:2-rows');
    // A short label keeps the header row roomy beside the filter panel
    expect(link).toHaveTextContent(/^CSV$/);
    expect(link).toHaveAttribute(
      'download',
      'mpdx-supervisor-report-2020-01-01.csv',
    );
    const rows = (buildURI as jest.Mock).mock.calls.at(-1)[0];
    expect(rows.map((row: string[]) => row[0])).toEqual([
      'Name',
      'John Smith',
      'Alice Jones',
    ]);
  });

  it('is disabled while the report loads', async () => {
    const { findByRole, getByRole } = renderButton();

    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
    expect(
      await findByRole('link', { name: 'Download CSV' }),
    ).toBeInTheDocument();
  });

  it('is disabled when nobody matches', async () => {
    const { findByText, getByRole } = renderButton({
      ManagedStaff: managedStaffMock([]),
    });

    await findByText('settled');
    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  });

  it('is disabled while the API asks for a narrower filter', async () => {
    const { findByText, getByRole } = renderButton({
      ManagedStaff: {
        managedStaff: () => {
          throw new GraphQLError('228 staff are in reach', {
            extensions: {
              code: 'FILTER_REQUIRED',
              count: 228,
              filtered: false,
            },
          });
        },
      },
    });

    await findByText('settled');
    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  });

  it('is disabled when a later page failed, so the file is never short', async () => {
    const firstPage = managedStaffMock([managedStaffMember()]);
    firstPage.managedStaff.pageInfo = {
      endCursor: 'cursor-1',
      hasNextPage: true,
    };
    const { findByText, getByRole } = renderButton({
      ManagedStaff: {
        managedStaff: (_root: unknown, args: { after?: string | null }) => {
          if (args.after) {
            throw new Error('Page failed');
          }
          return firstPage.managedStaff;
        },
      },
    });

    await findByText('page failed');
    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  });

  it('is disabled while a typed search waits to run, then links a file of the new rows', async () => {
    const { findByRole, getByRole } = renderButton();
    await findByRole('link', { name: 'Download CSV' });

    userEvent.click(getByRole('button', { name: 'Search Jones' }));

    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
    expect(
      await findByRole('link', { name: 'Download CSV' }, { timeout: 3000 }),
    ).toHaveAttribute('href', 'blob:1-rows');
    const rows = (buildURI as jest.Mock).mock.calls.at(-1)[0];
    expect(rows.map((row: string[]) => row[0])).toEqual([
      'Name',
      'Alice Jones',
    ]);
  });

  it('releases each file when the rows change and when it goes away', async () => {
    const { findByRole, getByRole, unmount } = renderButton();
    await findByRole('link', { name: 'Download CSV' });
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    userEvent.click(getByRole('button', { name: 'Search Jones' }));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:2-rows');

    await findByRole('link', { name: 'Download CSV' }, { timeout: 3000 });
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenLastCalledWith('blob:1-rows');
  });

  it('is disabled when a refresh failed, so it never exports the rows under the error', async () => {
    let calls = 0;
    const { findByRole, findByText, getByRole } = renderButton({
      ManagedStaff: {
        managedStaff: () => {
          calls += 1;
          if (calls > 1) {
            throw new Error('Refresh failed');
          }
          return managedStaffMock([managedStaffMember()]).managedStaff;
        },
      },
    });
    await findByRole('link', { name: 'Download CSV' });

    userEvent.click(getByRole('button', { name: 'Refresh' }));

    await findByText('refresh failed');
    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  });

  it('is disabled when a refresh asks for a narrower filter, so it never exports the hidden rows', async () => {
    let calls = 0;
    const { findByRole, findByText, getByRole } = renderButton({
      ManagedStaff: {
        managedStaff: () => {
          calls += 1;
          if (calls > 1) {
            throw new GraphQLError('228 staff are in reach', {
              extensions: {
                code: 'FILTER_REQUIRED',
                count: 228,
                filtered: false,
              },
            });
          }
          return managedStaffMock([managedStaffMember()]).managedStaff;
        },
      },
    });
    await findByRole('link', { name: 'Download CSV' });

    userEvent.click(getByRole('button', { name: 'Refresh' }));

    await findByText('filter required');
    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
  });
});
