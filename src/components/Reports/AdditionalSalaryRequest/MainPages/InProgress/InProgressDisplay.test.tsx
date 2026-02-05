import React from 'react';
import { ThemeProvider } from '@emotion/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { AsrStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { AdditionalSalaryRequestProvider } from '../../Shared/AdditionalSalaryRequestContext';
import { InProgressDisplay } from './InProgressDisplay';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();
const mockPush = jest.fn();

jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueue }),
}));

interface TestComponentProps {
  withSpouse?: boolean;
}

const TestComponent: React.FC<TestComponentProps> = ({
  withSpouse = false,
}) => {
  const hcmData = {
    hcm: withSpouse
      ? [
          {
            id: 'hcm-1',
            staffInfo: {
              firstName: 'John',
            },
          },
          {
            id: 'hcm-2',
            staffInfo: {
              firstName: 'Jane',
            },
          },
        ]
      : [
          {
            id: 'hcm-1',
            staffInfo: {
              firstName: 'John',
            },
          },
        ],
  };

  const additionalSalaryRequestData = {
    latestAdditionalSalaryRequest: {
      id: 'request-1',
      status: AsrStatusEnum.InProgress,
    },
  };

  const staffAccountIdData = {
    user: {
      staffAccountId: 'staff-1',
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter
        router={{ query: { accountListId: 'account-list-1' }, push: mockPush }}
      >
        <SnackbarProvider>
          <GqlMockedProvider
            mocks={{
              HcmData: hcmData,
              AdditionalSalaryRequest: additionalSalaryRequestData,
              StaffAccountId: staffAccountIdData,
            }}
            onCall={mutationSpy}
          >
            <AdditionalSalaryRequestProvider requestId="request-1">
              <InProgressDisplay />
            </AdditionalSalaryRequestProvider>
          </GqlMockedProvider>
        </SnackbarProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('InProgressDisplay', () => {
  it('renders component for single user', () => {
    const { getByText, queryByText } = render(<TestComponent />);

    expect(getByText('Your Additional Salary Request')).toBeInTheDocument();
    expect(
      getByText(
        'You have a saved Additional Salary Request in progress that has not been submitted.',
      ),
    ).toBeInTheDocument();
    expect(getByText('Continue Request')).toBeInTheDocument();
    expect(getByText('Discard & Start Over')).toBeInTheDocument();

    expect(
      queryByText(/Request additional salary for/),
    ).not.toBeInTheDocument();
  });

  it('renders component with married user', async () => {
    const { findByText } = render(<TestComponent withSpouse />);

    expect(
      await findByText('Request additional salary for Jane'),
    ).toBeInTheDocument();
  });

  it('should go to edit page when Continue Request is clicked', () => {
    const { getByText } = render(<TestComponent />);

    const continueButton = getByText('Continue Request');
    expect(continueButton.getAttribute('href')).toBe(
      '/accountLists/account-list-1/reports/additionalSalaryRequest?mode=edit',
    );
  });

  it('should call handleDeleteRequest when Discard & Start Over is clicked', async () => {
    const { getByText } = render(<TestComponent />);

    const discardButton = getByText('Discard & Start Over');
    userEvent.click(discardButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'DeleteAdditionalSalaryRequest',
        {
          id: 'request-1',
        },
      );
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Additional Salary Request discarded successfully.',
        { variant: 'success' },
      );
      expect(mockPush).toHaveBeenCalledWith(
        '/accountLists/account-list-1/reports/additionalSalaryRequest',
      );
    });
  });
});
