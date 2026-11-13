import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
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

jest.mock('react-csv/lib/core', () => ({
  buildURI: jest.fn(() => 'blob:supervisor-report'),
}));

const renderButton = (mocks: ApolloErgonoMockMap = {}) =>
  render(
    <TestRouter>
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{ ManagedStaff: ManagedStaffQuery }>
          mocks={{
            ManagedStaff: managedStaffMock([
              managedStaffMember(),
              managedStaffMember({
                firstName: 'Alice',
                lastName: 'Jones',
                personNumber: '10000003',
                staffAccountId: '1000000003',
              }),
            ]),
            ...mocks,
          }}
        >
          <MpdSupervisorReportProvider>
            <DownloadCsvButton />
            <Settled />
          </MpdSupervisorReportProvider>
        </GqlMockedProvider>
      </ThemeProvider>
    </TestRouter>,
  );

describe('DownloadCsvButton', () => {
  beforeEach(() => {
    URL.revokeObjectURL = jest.fn();
  });

  it('links to a dated CSV of the loaded rows', async () => {
    const { findByRole } = renderButton();

    const link = await findByRole('link', { name: 'Download CSV' });
    expect(link).toHaveAttribute('href', 'blob:supervisor-report');
    expect(link.getAttribute('download')).toMatch(
      /^mpdx-supervisor-report-\d{4}-\d{2}-\d{2}\.csv$/,
    );
    const rows = (buildURI as jest.Mock).mock.calls.at(-1)[0];
    expect(rows.map((row: string[]) => row[0])).toEqual([
      'Name',
      'John Smith',
      'Alice Jones',
    ]);
  });

  it('is disabled while the report loads', () => {
    const { getByRole } = renderButton();

    expect(getByRole('button', { name: 'Download CSV' })).toBeDisabled();
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

  afterEach(() => {
    (buildURI as jest.Mock).mockClear();
  });
});
