import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { AdditionalSalaryRequestTestWrapper } from '../AdditionalSalaryRequestTestWrapper';
import {
  AdditionalSalaryRequestProvider,
  useAdditionalSalaryRequest,
} from './AdditionalSalaryRequestContext';
import { getHeader } from './Helper/getHeader';

const mockEnqueue = jest.fn();

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const TestComponent: React.FC = () => {
  const {
    currentIndex,
    handleNextStep,
    handlePreviousStep,
    goToStep,
    isDrawerOpen,
    toggleDrawer,
    handleDeleteRequest,
    pageType,
    setPageType,
    staffAccountId,
    user,
    spouse,
    isInternational,
    traditional403bPercentage,
    roth403bPercentage,
    isNewAsr,
    setIsNewAsr,
    isSpouse,
    currentYear,
    requestId,
  } = useAdditionalSalaryRequest();

  return (
    <div>
      <h2>{getHeader(currentIndex)}</h2>
      <div aria-label="drawer state" data-open={isDrawerOpen}>
        Drawer: {isDrawerOpen ? 'open' : 'closed'}
      </div>
      <div data-testid="current-index">{currentIndex}</div>
      <div data-testid="page-type">{pageType}</div>
      <div data-testid="staff-account-id">{staffAccountId}</div>
      <div data-testid="user-id">{user?.staffInfo?.firstName}</div>
      <div data-testid="spouse-id">{spouse?.staffInfo?.firstName}</div>
      <div data-testid="is-international">{isInternational ? 'yes' : 'no'}</div>
      <div data-testid="traditional-403b">{traditional403bPercentage}</div>
      <div data-testid="roth-403b">{roth403bPercentage}</div>
      <div data-testid="is-new-asr">{isNewAsr ? 'yes' : 'no'}</div>
      <div data-testid="is-spouse">{isSpouse ? 'yes' : 'no'}</div>
      <div data-testid="current-year">{currentYear}</div>
      <div data-testid="request-id">{requestId}</div>

      <button onClick={handleNextStep}>Next Step</button>
      <button onClick={handlePreviousStep}>Previous Step</button>
      <button onClick={() => goToStep(2)}>Go to Receipt</button>
      <button onClick={toggleDrawer}>Toggle Drawer</button>
      <button onClick={() => setPageType(PageEnum.Edit)}>Set Edit Mode</button>
      <button onClick={() => setIsNewAsr(true)}>Set New ASR</button>

      <button onClick={() => handleDeleteRequest('test-id', true)}>
        Cancel Request
      </button>
      <button onClick={() => handleDeleteRequest('test-id', false)}>
        Discard Request
      </button>
    </div>
  );
};

interface TestWrapperProps {
  onCall?: jest.Mock;
  mockPush?: jest.Mock;
  pageType?: PageEnum;
  traditionalPercentage?: number;
  rothPercentage?: number;
}

const TestWrapper: React.FC<TestWrapperProps> = ({
  onCall,
  mockPush,
  pageType,
  traditionalPercentage = 0,
  rothPercentage = 0,
}) => (
  <AdditionalSalaryRequestTestWrapper
    onCall={onCall}
    mockPush={mockPush}
    pageType={pageType}
    traditionalDeductionPercentage={traditionalPercentage}
    rothDeductionPercentage={rothPercentage}
  >
    <TestComponent />
  </AdditionalSalaryRequestTestWrapper>
);

describe('AdditionalSalaryRequestContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws error when used outside provider', () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'Could not find AdditionalSalaryRequestContext. Make sure that your component is inside <AdditionalSalaryRequestProvider>.',
    );

    consoleError.mockRestore();
  });

  it('provides initial state', async () => {
    const { findByRole, getByTestId } = render(<TestWrapper />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(getByTestId('current-index')).toHaveTextContent('0');
    expect(getByTestId('page-type')).toHaveTextContent('New');
  });

  it('handles next step navigation', async () => {
    const { getByRole, findByRole, getByTestId } = render(<TestWrapper />);

    userEvent.click(getByRole('button', { name: 'Next Step' }));

    expect(
      await findByRole('heading', { name: 'Complete the Form' }),
    ).toBeInTheDocument();
    expect(getByTestId('current-index')).toHaveTextContent('1');
  });

  it('handles previous step navigation', async () => {
    const { getByRole, findByRole, getByTestId } = render(<TestWrapper />);

    userEvent.click(getByRole('button', { name: 'Next Step' }));
    await findByRole('heading', { name: 'Complete the Form' });

    userEvent.click(getByRole('button', { name: 'Previous Step' }));

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(getByTestId('current-index')).toHaveTextContent('0');
  });

  it('handles direct navigation to specific step', async () => {
    const { getByRole, findByRole, getByTestId } = render(<TestWrapper />);

    userEvent.click(getByRole('button', { name: 'Go to Receipt' }));

    expect(
      await findByRole('heading', { name: 'Receipt' }),
    ).toBeInTheDocument();
    expect(getByTestId('current-index')).toHaveTextContent('2');
  });

  it('toggles drawer state', () => {
    const { getByRole, getByLabelText } = render(<TestWrapper />);

    const drawerState = getByLabelText('drawer state');
    expect(drawerState).toHaveAttribute('data-open', 'true');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'false');

    userEvent.click(getByRole('button', { name: 'Toggle Drawer' }));
    expect(drawerState).toHaveAttribute('data-open', 'true');
  });

  it('handles page type changes', () => {
    const { getByRole, getByTestId } = render(<TestWrapper />);

    expect(getByTestId('page-type')).toHaveTextContent('New');

    userEvent.click(getByRole('button', { name: 'Set Edit Mode' }));

    expect(getByTestId('page-type')).toHaveTextContent('Edit');
  });

  it('handles cancel request mutation', async () => {
    const mutationSpy = jest.fn();
    const { getByRole } = render(<TestWrapper onCall={mutationSpy} />);

    userEvent.click(getByRole('button', { name: 'Cancel Request' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'DeleteAdditionalSalaryRequest',
        {
          id: 'test-id',
        },
      );
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Additional Salary Request cancelled successfully.',
        { variant: 'success' },
      );
    });
  });

  it('handles discard request mutation and resets state', async () => {
    const mutationSpy = jest.fn();
    const mockPush = jest.fn();
    const { getByRole, getByTestId } = render(
      <TestWrapper onCall={mutationSpy} mockPush={mockPush} />,
    );

    userEvent.click(getByRole('button', { name: 'Discard Request' }));

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'DeleteAdditionalSalaryRequest',
        {
          id: 'test-id',
        },
      );
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Additional Salary Request discarded successfully.',
        { variant: 'success' },
      );
    });

    await waitFor(() => {
      expect(getByTestId('page-type')).toHaveTextContent('New');
      expect(getByTestId('is-new-asr')).toHaveTextContent('yes');
    });
  });

  it('provides 403b percentages from user data', async () => {
    const { findByTestId } = render(<TestWrapper />);

    // The context provides the percentages as decimals
    // Values are from the mock data in the wrapper
    const traditional = await findByTestId('traditional-403b');
    const roth = await findByTestId('roth-403b');

    // Verify they are numbers (converted from percentage to decimal)
    expect(traditional.textContent).toMatch(/^\d+(\.\d+)?$/);
    expect(roth.textContent).toMatch(/^\d+(\.\d+)?$/);
  });

  it('manages isNewAsr state', async () => {
    const { getByRole, findByTestId } = render(<TestWrapper />);

    expect(await findByTestId('is-new-asr')).toHaveTextContent('no');

    userEvent.click(getByRole('button', { name: 'Set New ASR' }));

    await waitFor(async () => {
      expect(await findByTestId('is-new-asr')).toHaveTextContent('yes');
    });
  });

  it('provides current year from DateTime', async () => {
    const { findByTestId } = render(<TestWrapper />);

    const currentYear = DateTime.now().year;
    expect(await findByTestId('current-year')).toHaveTextContent(
      currentYear.toString(),
    );
  });

  it('uses requestId from query data when available', async () => {
    const { findByTestId } = render(<TestWrapper />);

    expect(await findByTestId('request-id')).toHaveTextContent(
      'test-request-id',
    );
  });

  it('initializes with provided page type', () => {
    const { getByTestId } = render(<TestWrapper pageType={PageEnum.Edit} />);

    expect(getByTestId('page-type')).toHaveTextContent('Edit');
  });

  it('defaults to PageEnum.New when no initial page type provided', () => {
    const { getByTestId } = render(<TestWrapper />);

    expect(getByTestId('page-type')).toHaveTextContent('New');
  });

  it('passes current year to SalaryInfo query', async () => {
    const onCall = jest.fn();
    render(<TestWrapper onCall={onCall} />);

    const currentYear = DateTime.now().year;
    await waitFor(() => {
      expect(onCall).toHaveGraphqlOperation('SalaryInfo', {
        year: currentYear,
      });
    });
  });

  describe('isSpouse functionality', () => {
    interface SpouseTestWrapperProps {
      isSpouse?: boolean;
      onCall?: jest.Mock;
    }

    const SpouseTestWrapper: React.FC<SpouseTestWrapperProps> = ({
      isSpouse = false,
      onCall,
    }) => (
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <TestRouter
            router={{
              query: {
                accountListId: 'account-list-1',
                isSpouse: isSpouse ? 'true' : undefined,
              },
            }}
          >
            <GqlMockedProvider
              mocks={{
                HcmData: {
                  hcm: [
                    {
                      staffInfo: {
                        firstName: 'Primary',
                        lastName: 'Person',
                        isInternational: false,
                      },
                      fourOThreeB: {
                        currentTaxDeferredContributionPercentage: 10,
                        currentRothContributionPercentage: 5,
                      },
                    },
                    {
                      staffInfo: {
                        firstName: 'Spouse',
                        lastName: 'Person',
                        isInternational: true,
                      },
                      fourOThreeB: {
                        currentTaxDeferredContributionPercentage: 8,
                        currentRothContributionPercentage: 3,
                      },
                    },
                  ],
                },
                AdditionalSalaryRequest: {
                  latestAdditionalSalaryRequest: {
                    id: 'test-request-id',
                  },
                },
                StaffAccountId: {
                  user: {
                    staffAccountId: 'staff-123',
                  },
                },
                SalaryInfo: {
                  salaryInfo: {
                    id: 'salary-info-1',
                  },
                },
              }}
              onCall={onCall}
            >
              <AdditionalSalaryRequestProvider>
                <TestComponent />
              </AdditionalSalaryRequestProvider>
            </GqlMockedProvider>
          </TestRouter>
        </SnackbarProvider>
      </ThemeProvider>
    );

    it('uses primary person as user when isSpouse is false', async () => {
      const { findByTestId } = render(<SpouseTestWrapper isSpouse={false} />);

      await waitFor(async () => {
        expect(await findByTestId('user-id')).toHaveTextContent('Primary');
      });
      expect(await findByTestId('spouse-id')).toHaveTextContent('Spouse');
      expect(await findByTestId('is-spouse')).toHaveTextContent('no');
      expect(await findByTestId('is-international')).toHaveTextContent('no');
    });

    it('swaps user and spouse when isSpouse is true', async () => {
      const { findByTestId } = render(<SpouseTestWrapper isSpouse={true} />);

      await waitFor(async () => {
        expect(await findByTestId('user-id')).toHaveTextContent('Spouse');
      });
      expect(await findByTestId('spouse-id')).toHaveTextContent('Primary');
      expect(await findByTestId('is-spouse')).toHaveTextContent('yes');
      expect(await findByTestId('is-international')).toHaveTextContent('yes');
    });

    it('passes isSpouse to AdditionalSalaryRequest query when true', async () => {
      const onCall = jest.fn();
      render(<SpouseTestWrapper isSpouse={true} onCall={onCall} />);

      await waitFor(() => {
        expect(onCall).toHaveGraphqlOperation('AdditionalSalaryRequest', {
          isSpouse: true,
        });
      });
    });

    it('reads isSpouse from router query parameter', async () => {
      const { findByTestId } = render(<SpouseTestWrapper isSpouse={false} />);

      // When router query has isSpouse undefined, context should reflect that
      await waitFor(async () => {
        expect(await findByTestId('is-spouse')).toHaveTextContent('no');
      });
    });

    it('uses correct 403b percentages based on isSpouse', async () => {
      const { findByTestId } = render(<SpouseTestWrapper isSpouse={true} />);

      // When isSpouse is true, uses spouse's percentages (8% and 3%)
      await waitFor(async () => {
        expect(await findByTestId('traditional-403b')).toHaveTextContent(
          '0.08',
        );
      });
      expect(await findByTestId('roth-403b')).toHaveTextContent('0.03');
    });
  });
});
