import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import matchMediaMock from '__tests__/util/matchMediaMock';
import { desktopWidth, phoneWidth } from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { DuplicateMinistryHousingAllowanceRequestMutation } from '../MinisterHousingAllowance.generated';
import {
  ContextType,
  HcmData,
  MinisterHousingAllowanceContext,
} from '../Shared/Context/MinisterHousingAllowanceContext';
import { mockMHARequest } from '../mockData';
import { CurrentBoardApproved } from './CurrentBoardApproved';
import { MHARequest } from './types';

const newRequestId = 'new-request-id';
const mutationSpy = jest.fn();
const mockPush = jest.fn();

const approvedMHARequest: MHARequest = {
  ...mockMHARequest,
  updatedAt: '2022-12-01',
  requestAttributes: {
    ...mockMHARequest.requestAttributes,
    hrApprovedAt: '2023-01-15',
  },
};

// Every amount is different, so each one can only belong to one person and label
const marriedContext: Partial<ContextType> = {
  isMarried: true,
  preferredName: 'John',
  spousePreferredName: 'Jane',
  userApprovedOverallAmount: 2000,
  spouseApprovedOverallAmount: 800,
  userTakenAmount: 1200,
  spouseTakenAmount: 300,
};

// MHAs approved before the MPDX launch only exist in HCM (no request)
const hcmOnlyMarriedContext: Partial<ContextType> = {
  ...marriedContext,
  userBoardApprovedForMHA: true,
  spouseBoardApprovedForMHA: true,
  userHcmData: {
    mhaRequest: { boardApprovedOnDate: '2026-06-01' },
  } as unknown as HcmData,
  spouseHcmData: {
    mhaRequest: { boardApprovedOnDate: '2026-05-15' },
  } as unknown as HcmData,
};

// The text of each element, in the order they appear on the page. On phones
// the people are stacked, so this is the top to bottom order on screen.
const textInPageOrder = (elements: HTMLElement[]) =>
  [...elements]
    .sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    .map((element) => element.textContent);

interface TestComponentProps {
  contextValue: Partial<ContextType>;
  router?: {
    push?: jest.Mock;
    query?: { accountListId?: string };
  };
  hasOpenRequest?: boolean;
  request?: MHARequest | null;
}

const TestComponent: React.FC<TestComponentProps> = ({
  contextValue,
  router = {},
  hasOpenRequest = false,
  request = approvedMHARequest,
}) => {
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
            <CurrentBoardApproved
              request={request}
              hasOpenRequest={hasOpenRequest}
            />
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
          userApprovedOverallAmount: 1500,
          spouseApprovedOverallAmount: 1500,
          userTakenAmount: 1000,
          spouseTakenAmount: 500,
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
          userApprovedOverallAmount: 1500,
          userTakenAmount: 1000,
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

  it('shows distinct per-person approved and claimed amounts from HCM', () => {
    const { getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: true,
          preferredName: 'John',
          spousePreferredName: 'Jane',
          userApprovedOverallAmount: 2000,
          spouseApprovedOverallAmount: 800,
          userTakenAmount: 1200,
          spouseTakenAmount: 300,
          userHcmData: {
            staffInfo: { personNumber: '000123456' },
          } as unknown as HcmData,
          spouseHcmData: {
            staffInfo: { personNumber: '100123456' },
          } as unknown as HcmData,
        }}
      />,
    );

    // MHA Approved by Board (per person)
    expect(getByText('$2,000.00')).toBeInTheDocument();
    expect(getByText('$800.00')).toBeInTheDocument();
    // MHA Claimed in Salary (per person)
    expect(getByText('$1,200.00')).toBeInTheDocument();
    expect(getByText('$300.00')).toBeInTheDocument();
  });

  it('renders $0.00 when HCM approved/claimed amounts are null', () => {
    const { getAllByText } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userApprovedOverallAmount: null,
          userTakenAmount: null,
          userHcmData: {
            staffInfo: { personNumber: '000123456' },
          } as unknown as HcmData,
          spouseHcmData: null,
        }}
      />,
    );

    expect(getAllByText('$0.00')).toHaveLength(2);
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
                  userEligibleForMHA: true,
                  userHcmData: {
                    staffInfo: {
                      personNumber: '000123456',
                    },
                  } as unknown as HcmData,
                  spouseHcmData: null,
                } as ContextType
              }
            >
              <CurrentBoardApproved
                request={mockMHARequest}
                hasOpenRequest={false}
              />
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
            requestId: '1',
          },
        },
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/accountLists/account-list-1/hrTools/mhaCalculator/${newRequestId}?mode=edit`,
      );
    });
  });

  it('shows HCM approved dates and hides request actions without a request', () => {
    const { getByText, queryByText, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <MinisterHousingAllowanceContext.Provider
              value={
                {
                  isMarried: true,
                  preferredName: 'John',
                  spousePreferredName: 'Jane',
                  userBoardApprovedForMHA: true,
                  spouseBoardApprovedForMHA: true,
                  userApprovedOverallAmount: 2000,
                  spouseApprovedOverallAmount: 800,
                  userTakenAmount: 1200,
                  spouseTakenAmount: 300,
                  userHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2026-06-01' },
                  } as unknown as HcmData,
                  spouseHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2026-05-15' },
                  } as unknown as HcmData,
                } as ContextType
              }
            >
              <CurrentBoardApproved request={null} hasOpenRequest={false} />
            </MinisterHousingAllowanceContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByText('$2,000.00')).toBeInTheDocument();
    expect(getByText('Approved on: 6/1/2026')).toBeInTheDocument();
    expect(getByText('$800.00')).toBeInTheDocument();
    expect(getByText('Approved on: 5/15/2026')).toBeInTheDocument();

    expect(queryByText(/last updated/i)).not.toBeInTheDocument();
    expect(queryByText('View Current MHA')).not.toBeInTheDocument();
    expect(queryByText('Update Current MHA')).not.toBeInTheDocument();
    expect(queryByRole('button', { name: 'Print' })).not.toBeInTheDocument();
  });

  it('hides the HCM approved date for a person whose approved amount is 0', () => {
    const { getByText, queryByText } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <MinisterHousingAllowanceContext.Provider
              value={
                {
                  isMarried: true,
                  preferredName: 'John',
                  spousePreferredName: 'Jane',
                  userBoardApprovedForMHA: true,
                  spouseBoardApprovedForMHA: true,
                  userApprovedOverallAmount: 36600,
                  spouseApprovedOverallAmount: 0,
                  userTakenAmount: 36600,
                  spouseTakenAmount: 0,
                  userHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2024-03-01' },
                  } as unknown as HcmData,
                  spouseHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2016-08-01' },
                  } as unknown as HcmData,
                } as ContextType
              }
            >
              <CurrentBoardApproved request={null} hasOpenRequest={false} />
            </MinisterHousingAllowanceContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByText('Approved on: 3/1/2024')).toBeInTheDocument();
    expect(queryByText('Approved on: 8/1/2016')).not.toBeInTheDocument();
  });

  it('leaves out the row for a spouse without a board approval when there is no request', () => {
    const { getByRole, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <MinisterHousingAllowanceContext.Provider
              value={
                {
                  isMarried: true,
                  preferredName: 'John',
                  spousePreferredName: 'Jane',
                  userBoardApprovedForMHA: true,
                  spouseBoardApprovedForMHA: false,
                  userApprovedOverallAmount: 36600,
                  spouseApprovedOverallAmount: 0,
                  userTakenAmount: 36600,
                  spouseTakenAmount: 0,
                  userHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2024-03-01' },
                  } as unknown as HcmData,
                  spouseHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2016-08-01' },
                  } as unknown as HcmData,
                } as ContextType
              }
            >
              <CurrentBoardApproved request={null} hasOpenRequest={false} />
            </MinisterHousingAllowanceContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByRole('cell', { name: 'John' })).toBeInTheDocument();
    expect(queryByRole('cell', { name: 'Jane' })).not.toBeInTheDocument();
  });

  it('leaves out the row for a user without a board approval when there is no request', () => {
    const { getByRole, queryByRole } = render(
      <ThemeProvider theme={theme}>
        <TestRouter>
          <GqlMockedProvider>
            <MinisterHousingAllowanceContext.Provider
              value={
                {
                  isMarried: true,
                  preferredName: 'John',
                  spousePreferredName: 'Jane',
                  userBoardApprovedForMHA: false,
                  spouseBoardApprovedForMHA: true,
                  userApprovedOverallAmount: 0,
                  spouseApprovedOverallAmount: 15000,
                  userTakenAmount: 0,
                  spouseTakenAmount: 10000,
                  userHcmData: {
                    mhaRequest: { boardApprovedOnDate: null },
                  } as unknown as HcmData,
                  spouseHcmData: {
                    mhaRequest: { boardApprovedOnDate: '2026-06-01' },
                  } as unknown as HcmData,
                } as ContextType
              }
            >
              <CurrentBoardApproved request={null} hasOpenRequest={false} />
            </MinisterHousingAllowanceContext.Provider>
          </GqlMockedProvider>
        </TestRouter>
      </ThemeProvider>,
    );

    expect(getByRole('cell', { name: 'Jane' })).toBeInTheDocument();
    expect(queryByRole('cell', { name: 'John' })).not.toBeInTheDocument();
  });

  it('hides Update Current MHA when nobody has a current IBS certification', () => {
    const { queryByText, getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userEligibleForMHA: false,
          userBoardApprovedForMHA: true,
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: null,
        }}
      />,
    );

    expect(getByText('View Current MHA')).toBeInTheDocument();
    expect(queryByText('Update Current MHA')).not.toBeInTheDocument();
  });

  it('should hide Update Current MHA button when there is an open request', () => {
    const { queryByText, getByText } = render(
      <TestComponent
        contextValue={{
          isMarried: false,
          preferredName: 'John',
          spousePreferredName: '',
          userEligibleForMHA: true,
          userHcmData: {
            staffInfo: {
              personNumber: '000123456',
            },
          } as unknown as HcmData,
          spouseHcmData: null,
        }}
        hasOpenRequest
      />,
    );

    expect(getByText('View Current MHA')).toBeInTheDocument();
    expect(queryByText('Update Current MHA')).not.toBeInTheDocument();
  });

  describe('on phones', () => {
    beforeEach(() => {
      matchMediaMock({ width: phoneWidth });
    });

    afterEach(() => {
      matchMediaMock({ width: window.innerWidth });
    });

    it.each([360, phoneWidth, 599])(
      'stacks each person with labeled amounts instead of a table at %ipx',
      (width) => {
        matchMediaMock({ width });
        const { getByText, getAllByText, queryByRole } = render(
          <TestComponent contextValue={marriedContext} />,
        );

        expect(queryByRole('table')).not.toBeInTheDocument();
        expect(queryByRole('columnheader')).not.toBeInTheDocument();

        // Name on top, then each label followed by that person's amount
        expect(
          textInPageOrder([
            getByText('John'),
            getByText('Jane'),
            ...getAllByText('Approved by Board'),
            ...getAllByText('Claimed in Salary'),
            getByText('$2,000.00'),
            getByText('$1,200.00'),
            getByText('$800.00'),
            getByText('$300.00'),
          ]),
        ).toEqual([
          'John',
          'Approved by Board',
          '$2,000.00',
          'Claimed in Salary',
          '$1,200.00',
          'Jane',
          'Approved by Board',
          '$800.00',
          'Claimed in Salary',
          '$300.00',
        ]);
      },
    );

    it('still shows the approved on and last updated dates for each person', () => {
      const { getAllByText } = render(
        <TestComponent contextValue={marriedContext} />,
      );

      expect(getAllByText('Approved on: 1/15/2023')).toHaveLength(2);
      expect(getAllByText('Last updated: 12/1/2022')).toHaveLength(2);
    });

    it('shows a single person once, with no spouse', () => {
      const { getByText, queryByText } = render(
        <TestComponent
          contextValue={{
            isMarried: false,
            preferredName: 'John',
            spousePreferredName: '',
            userApprovedOverallAmount: 1500,
            userTakenAmount: 1000,
          }}
        />,
      );

      expect(
        textInPageOrder([
          getByText('John'),
          getByText('Approved by Board'),
          getByText('$1,500.00'),
          getByText('Claimed in Salary'),
          getByText('$1,000.00'),
        ]),
      ).toEqual([
        'John',
        'Approved by Board',
        '$1,500.00',
        'Claimed in Salary',
        '$1,000.00',
      ]);
      expect(queryByText('N/A')).not.toBeInTheDocument();
    });

    it('shows each person their own HCM approved date and no last updated date without a request', () => {
      const { getByText, queryByText, queryByRole } = render(
        <TestComponent contextValue={hcmOnlyMarriedContext} request={null} />,
      );

      expect(
        textInPageOrder([
          getByText('John'),
          getByText('Jane'),
          getByText('Approved on: 6/1/2026'),
          getByText('Approved on: 5/15/2026'),
        ]),
      ).toEqual([
        'John',
        'Approved on: 6/1/2026',
        'Jane',
        'Approved on: 5/15/2026',
      ]);
      expect(queryByText(/last updated/i)).not.toBeInTheDocument();
      expect(queryByText('View Current MHA')).not.toBeInTheDocument();
      expect(queryByRole('button', { name: 'Print' })).not.toBeInTheDocument();
    });

    it('hides the HCM approved date for a person whose approved amount is 0', () => {
      const { getByText, getAllByText } = render(
        <TestComponent
          contextValue={{
            ...hcmOnlyMarriedContext,
            spouseApprovedOverallAmount: 0,
            spouseTakenAmount: 0,
          }}
          request={null}
        />,
      );

      expect(getByText('Jane')).toBeInTheDocument();
      // Only John's date line shows, Jane gets no date and no loading skeleton
      expect(getAllByText(/^Approved on:/)).toEqual([
        getByText('Approved on: 6/1/2026'),
      ]);
    });

    it('leaves out a spouse without a board approval when there is no request', () => {
      const { getByText, queryByText } = render(
        <TestComponent
          contextValue={{
            ...hcmOnlyMarriedContext,
            spouseBoardApprovedForMHA: false,
          }}
          request={null}
        />,
      );

      expect(getByText('John')).toBeInTheDocument();
      expect(getByText('$2,000.00')).toBeInTheDocument();
      expect(queryByText('Jane')).not.toBeInTheDocument();
      expect(queryByText('$800.00')).not.toBeInTheDocument();
    });
  });

  describe('from the sm breakpoint up', () => {
    afterEach(() => {
      matchMediaMock({ width: window.innerWidth });
    });

    it.each([600, 768, desktopWidth])(
      'keeps the three column table at %ipx',
      (width) => {
        matchMediaMock({ width });
        const { getByRole, queryByText } = render(
          <TestComponent contextValue={marriedContext} />,
        );

        expect(getByRole('table')).toHaveTableStructure({
          columnHeaders: [
            'Spouse',
            'MHA Approved by Board',
            'MHA Claimed in Salary',
          ],
          cells: [
            [
              'John',
              expect.stringContaining('$2,000.00'),
              expect.stringContaining('$1,200.00'),
            ],
            [
              'Jane',
              expect.stringContaining('$800.00'),
              expect.stringContaining('$300.00'),
            ],
          ],
        });
        expect(queryByText('Approved by Board')).not.toBeInTheDocument();
        expect(queryByText('Claimed in Salary')).not.toBeInTheDocument();
      },
    );
  });
});
