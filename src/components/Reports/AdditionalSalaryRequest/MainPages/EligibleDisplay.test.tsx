import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AdditionalSalaryRequestProvider } from '../Shared/AdditionalSalaryRequestContext';
import { EligibleDisplay } from './EligibleDisplay';

const accountListId = 'account-list-1';

interface TestWrapperProps {
  allRequestStatus: string;
  preferredName?: string;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  allRequestStatus,
  preferredName = 'John',
}) => {
  const hcmData = {
    hcm: [
      {
        id: 'hcm-1',
        staffInfo: {
          preferredName,
        },
      },
    ],
  };

  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestRouter
          router={{
            query: {
              accountListId,
            },
          }}
        >
          <SnackbarProvider>
            <GqlMockedProvider
              mocks={{
                HcmData: hcmData,
                AdditionalSalaryRequests: {
                  additionalSalaryRequests: {
                    nodes: [],
                  },
                },
                StaffAccountId: {
                  user: {
                    staffAccountId: 'staff-account-1',
                  },
                },
              }}
            >
              <AdditionalSalaryRequestProvider>
                <EligibleDisplay allRequestStatus={allRequestStatus} />
              </AdditionalSalaryRequestProvider>
            </GqlMockedProvider>
          </SnackbarProvider>
        </TestRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('EligibleDisplay', () => {
  it('renders the page title', async () => {
    const { findByText } = render(<TestWrapper allRequestStatus="None" />);

    expect(
      await findByText('Your Additional Salary Request'),
    ).toBeInTheDocument();
  });

  it('displays no request message when allRequestStatus is None', async () => {
    const { findByText } = render(<TestWrapper allRequestStatus="None" />);

    expect(
      await findByText(/No Additional Salary Request has been created yet/i),
    ).toBeInTheDocument();
  });

  it('displays create ASR instruction when allRequestStatus is None', async () => {
    const { findByText } = render(<TestWrapper allRequestStatus="None" />);

    expect(
      await findByText(/You may create one by clicking/i),
    ).toBeInTheDocument();
  });

  it('displays pending request message when status is In Progress', async () => {
    const { findByText } = render(
      <TestWrapper allRequestStatus="In Progress" />,
    );

    expect(
      await findByText(/currently has an Additional Salary Request/i),
    ).toBeInTheDocument();
  });

  it('displays the status in the pending message', async () => {
    const { findByText } = render(
      <TestWrapper allRequestStatus="In Progress" />,
    );

    expect(await findByText(/status of In Progress/i)).toBeInTheDocument();
  });

  it('displays pending request message when status is Pending', async () => {
    const { findByText } = render(<TestWrapper allRequestStatus="Pending" />);

    expect(
      await findByText(/currently has an Additional Salary Request/i),
    ).toBeInTheDocument();
    expect(await findByText(/status of Pending/i)).toBeInTheDocument();
  });

  it('displays pending request message when status is Approved', async () => {
    const { findByText } = render(<TestWrapper allRequestStatus="Approved" />);

    expect(
      await findByText(/currently has an Additional Salary Request/i),
    ).toBeInTheDocument();
    expect(await findByText(/status of Approved/i)).toBeInTheDocument();
  });

  it('displays pending request message when status is Action Required', async () => {
    const { findByText } = render(
      <TestWrapper allRequestStatus="Action Required" />,
    );

    expect(
      await findByText(/currently has an Additional Salary Request/i),
    ).toBeInTheDocument();
    expect(await findByText(/status of Action Required/i)).toBeInTheDocument();
  });

  it('displays the user preferred name in the pending message', async () => {
    const { findByText } = render(
      <TestWrapper allRequestStatus="In Progress" preferredName="Jane" />,
    );

    expect(await findByText(/Jane currently has/i)).toBeInTheDocument();
  });

  it('displays note about single request at a time for None status', async () => {
    const { findByText } = render(<TestWrapper allRequestStatus="None" />);

    expect(
      await findByText(
        /you may only process one additional salary request at a time/i,
      ),
    ).toBeInTheDocument();
  });

  it('displays note about single request at a time for existing status', async () => {
    const { findByText } = render(
      <TestWrapper allRequestStatus="In Progress" />,
    );

    expect(
      await findByText(
        /you may only process one additional salary request at a time/i,
      ),
    ).toBeInTheDocument();
  });
});
