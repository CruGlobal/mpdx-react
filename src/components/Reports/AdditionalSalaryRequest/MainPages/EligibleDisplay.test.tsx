import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { AdditionalSalaryRequestProvider } from '../Shared/AdditionalSalaryRequestContext';
import { EligibleDisplay } from './EligibleDisplay';

const accountListId = 'account-list-1';

interface TestWrapperProps {
  status?: AsrStatusEnum;
  preferredName?: string;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  status,
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
                AdditionalSalaryRequest: {
                  latestAdditionalSalaryRequest: status
                    ? {
                        id: 'asr-1',
                        status,
                      }
                    : null,
                },
                StaffAccountId: {
                  user: {
                    staffAccountId: 'staff-account-1',
                  },
                },
              }}
            >
              <AdditionalSalaryRequestProvider>
                <EligibleDisplay />
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
    const { findByText } = render(
      <TestWrapper status={AsrStatusEnum.Pending} />,
    );

    expect(
      await findByText('Your Additional Salary Request'),
    ).toBeInTheDocument();
  });

  it('displays pending request message when status is Pending', async () => {
    const { findByText } = render(
      <TestWrapper status={AsrStatusEnum.Pending} />,
    );

    expect(
      await findByText(/currently has a pending request/i),
    ).toBeInTheDocument();
  });

  it('displays the user preferred name in the pending message', async () => {
    const { findByText } = render(
      <TestWrapper status={AsrStatusEnum.Pending} preferredName="Jane" />,
    );

    expect(await findByText(/Jane currently has/i)).toBeInTheDocument();
  });

  it('displays note about single request at a time for pending status', async () => {
    const { findByText } = render(
      <TestWrapper status={AsrStatusEnum.Pending} />,
    );

    expect(
      await findByText(
        /you may only process one additional salary request at a time/i,
      ),
    ).toBeInTheDocument();
  });

  it('displays action required message when status is ActionRequired', async () => {
    const { findByText } = render(
      <TestWrapper status={AsrStatusEnum.ActionRequired} />,
    );

    expect(
      await findByText(/Action is required to complete your pending request/i),
    ).toBeInTheDocument();
  });
});
