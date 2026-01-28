import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from '../AdditionalSalaryRequestContext';
import { SavingStatus } from './SavingStatus';

interface TestWrapperProps {
  children: React.ReactNode;
  updatedAt?: string | null;
  skipRequest?: boolean;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  children,
  updatedAt = DateTime.now().minus({ minutes: 5 }).toISO(),
  skipRequest = false,
}) => {
  const mocks = {
    AdditionalSalaryRequest: {
      additionalSalaryRequest: skipRequest
        ? null
        : {
            id: 'test-request-id',
            updatedAt,
          },
    },
    AdditionalSalaryRequests: {
      additionalSalaryRequests: {
        nodes: [],
      },
    },
    StaffAccountId: {
      user: {
        staffAccountId: 'staff-1',
      },
    },
    HcmData: {
      hcm: [],
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <TestRouter
          router={{
            query: { accountListId: 'account-list-1', mode: 'edit' },
          }}
        >
          <SnackbarProvider>
            <GqlMockedProvider mocks={mocks}>
              <AdditionalSalaryRequestProvider requestId="test-request-id">
                {children}
              </AdditionalSalaryRequestProvider>
            </GqlMockedProvider>
          </SnackbarProvider>
        </TestRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

const MutatingTrigger: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const { trackMutation } = useAdditionalSalaryRequest();

  React.useEffect(() => {
    trackMutation(new Promise(() => {}));
  }, [trackMutation]);

  return children;
};

describe('SavingStatus', () => {
  it('renders null when request is not available', async () => {
    const { container } = render(
      <TestWrapper skipRequest>
        <SavingStatus />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(container.textContent).toBe('');
    });
  });

  it('renders null when updatedAt is not available', async () => {
    const { container } = render(
      <TestWrapper updatedAt={null}>
        <SavingStatus />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(container.textContent).toBe('');
    });
  });

  it('displays last saved time when not mutating', async () => {
    const updatedAt = DateTime.now().minus({ minutes: 5 }).toISO();

    const { findByText } = render(
      <TestWrapper updatedAt={updatedAt}>
        <SavingStatus />
      </TestWrapper>,
    );

    expect(await findByText(/Last saved/)).toBeInTheDocument();
  });

  it('displays saving indicator when mutating', async () => {
    const updatedAt = DateTime.now().minus({ minutes: 5 }).toISO();

    const mocks = {
      AdditionalSalaryRequest: {
        additionalSalaryRequest: {
          id: 'test-request-id',
          updatedAt,
        },
      },
      AdditionalSalaryRequests: {
        additionalSalaryRequests: {
          nodes: [],
        },
      },
      StaffAccountId: {
        user: {
          staffAccountId: 'staff-1',
        },
      },
      HcmData: {
        hcm: [],
      },
    };

    const { findByText, findByRole } = render(
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          <TestRouter
            router={{
              query: { accountListId: 'account-list-1', mode: 'edit' },
            }}
          >
            <SnackbarProvider>
              <GqlMockedProvider mocks={mocks}>
                <AdditionalSalaryRequestProvider requestId="test-request-id">
                  <MutatingTrigger>
                    <SavingStatus />
                  </MutatingTrigger>
                </AdditionalSalaryRequestProvider>
              </GqlMockedProvider>
            </SnackbarProvider>
          </TestRouter>
        </I18nextProvider>
      </ThemeProvider>,
    );

    expect(await findByText('Saving')).toBeInTheDocument();
    expect(await findByRole('progressbar')).toBeInTheDocument();
  });
});
