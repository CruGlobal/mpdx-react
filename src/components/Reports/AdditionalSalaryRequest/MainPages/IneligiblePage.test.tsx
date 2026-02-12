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
import { IneligiblePage } from './IneligiblePage';

const accountListId = 'account-list-1';

interface TestWrapperProps {
  ineligibilityReason?: string;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  ineligibilityReason = 'You are not eligible for this request.',
}) => {
  const hcmData = {
    hcm: [
      {
        id: 'hcm-1',
        asrEit: {
          asrEligibility: false,
          ineligibilityReason,
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
                AdditionalSalaryRequest: {
                  latestAdditionalSalaryRequest: null,
                },
                StaffAccountId: {
                  user: {
                    staffAccountId: 'staff-account-1',
                  },
                },
              }}
            >
              <AdditionalSalaryRequestProvider>
                <IneligiblePage />
              </AdditionalSalaryRequestProvider>
            </GqlMockedProvider>
          </SnackbarProvider>
        </TestRouter>
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('IneligiblePage', () => {
  it('renders the page title', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(await findByText('Form Unavailable')).toBeInTheDocument();
  });

  it('displays the ineligibility reason', async () => {
    const { findByText } = render(<TestWrapper />);

    expect(
      await findByText('You are not eligible for this request.'),
    ).toBeInTheDocument();
  });

  it('displays a custom ineligibility reason', async () => {
    const { findByText } = render(
      <TestWrapper ineligibilityReason="Your account is currently suspended." />,
    );

    expect(
      await findByText('Your account is currently suspended.'),
    ).toBeInTheDocument();
  });

  it('renders empty when no ineligibility reason is provided', async () => {
    const { findByText, queryByText } = render(
      <TestWrapper ineligibilityReason={undefined} />,
    );

    expect(await findByText('Form Unavailable')).toBeInTheDocument();
    expect(
      queryByText('You are not eligible for this request.'),
    ).not.toBeInTheDocument();
  });
});
