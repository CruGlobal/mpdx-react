import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { DuplicateMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import {
  ContextType,
  HcmData,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from '../mockData';
import { CurrentBoardApproved } from './CurrentBoardApproved';

const newRequestId = 'new-request-id';
const mutationSpy = jest.fn();
const mockPush = jest.fn();
interface TestComponentProps {
  contextValue: Partial<ContextType>;
  router?: {
    push?: jest.Mock;
    query?: { accountListId?: string };
  };
}

const TestComponent: React.FC<TestComponentProps> = ({
  contextValue,
  router = {},
}) => {
  const approvedMHARequest = {
    ...mockMHARequest,
    updatedAt: '2022-12-01',
    requestAttributes: {
      ...mockMHARequest.requestAttributes,
      hrApprovedAt: '2023-01-15',
      approvedOverallAmount: 1500,
      staffSpecific: 1000,
      spouseSpecific: 500,
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{
          DuplicateMinistryHousingAllowanceRequest: DuplicateMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          <MinisterHousingAllowanceContext.Provider
            value={contextValue as ContextType}
          >
            <CurrentBoardApproved request={approvedMHARequest} />
          </MinisterHousingAllowanceContext.Provider>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  );
};

describe('CurrentBoardApproved Component', () => {
  it('should render correctly for married person', () => {
    const { queryByText, queryByRole, getAllByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: {
            staffInfo: {
              personNumber: '100123456',
            },
          } as unknown as HcmData,
        }}
      />,
    );

    expect(queryByText('Current Board Approved MHA')).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: /spouse/i }),
    ).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: /mha approved by board/i }),
    ).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: /mha claimed in salary/i }),
    ).toBeInTheDocument();

    expect(queryByRole('cell', { name: 'John' })).toBeInTheDocument();
    expect(getAllByText('$1,500.00')).toHaveLength(2);
    expect(getAllByText('Approved on: 1/15/2023')).toHaveLength(2);
    expect(queryByText('$1,000.00')).toBeInTheDocument();
    expect(getAllByText('Last updated: 12/1/2022')).toHaveLength(2);

    expect(queryByRole('cell', { name: 'Jane' })).toBeInTheDocument();
    expect(queryByText('$500.00')).toBeInTheDocument();
  });

  it('should render correctly for single person', () => {
    const { queryByText, queryByRole, getAllByText } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: null,
        }}
      />,
    );

    expect(queryByText('Current Board Approved MHA')).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: /spouse/i }),
    ).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: /mha approved by board/i }),
    ).toBeInTheDocument();
    expect(
      queryByRole('columnheader', { name: /mha claimed in salary/i }),
    ).toBeInTheDocument();

    expect(queryByRole('cell', { name: 'John' })).toBeInTheDocument();
    expect(getAllByText('$1,500.00')).toHaveLength(1);
    expect(queryByText('$1,000.00')).toBeInTheDocument();

    // Spouse data should not be rendered
    expect(queryByText('Jane')).not.toBeInTheDocument();
  });

  it('should navigate to edit page with new requestId after duplicate mutation', async () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={{ push: mockPush }}>
          <GqlMockedProvider<{
            DuplicateMinistryHousingAllowanceRequest: DuplicateMinistryHousingAllowanceRequestMutation;
          }>
            mocks={{
              DuplicateMinistryHousingAllowanceRequest: {
                duplicateMinistryHousingAllowanceRequest: {
                  ministryHousingAllowanceRequest: {
                    id: newRequestId,
                  },
                },
              },
            }}
            onCall={mutationSpy}
          >
            <MinisterHousingAllowanceContext.Provider
              value={
                {
                  isMarried: false,
                  preferredName: 'John',
                  spousePreferredName: '',
                  requestId: 'old-request-id',
                  userHcmData: {
                    staffInfo: {
                      personNumber: '000123456',
                    },
                  } as unknown as HcmData,
                  spouseHcmData: null,
                } as ContextType
              }
            >
              <CurrentBoardApproved request={mockMHARequest} />
            </MinisterHousingAllowanceContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    const updateButton = getByText('Update Current MHA');
    userEvent.click(updateButton);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'DuplicateMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'old-request-id',
          },
        },
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/accountLists/account-list-1/reports/housingAllowance/${newRequestId}?mode=edit`,
      );
    });
  });
});
