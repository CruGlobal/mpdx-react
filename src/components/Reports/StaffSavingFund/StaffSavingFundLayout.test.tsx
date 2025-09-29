import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render } from '__tests__/util/testingLibraryReactMock';
import theme from 'src/theme';
import { StaffAccountQuery } from '../StaffAccount.generated';
import { StaffSavingFundContext } from './StaffSavingFundContext';
import { StaffSavingFundLayout } from './StaffSavingFundLayout';

const title = 'Savings Fund Report';
const id = 'staffSavingFund';

const onNavListToggle = jest.fn();
const mutationSpy = jest.fn();

const mockStaffAccount = {
  StaffAccount: {
    staffAccount: {
      id: '12345',
      name: 'Test Account',
    },
  },
};

const MockStaffSavingFundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <StaffSavingFundContext.Provider
    value={{
      isNavListOpen: true,
      onNavListToggle: onNavListToggle,
    }}
  >
    {children}
  </StaffSavingFundContext.Provider>
);

const Components = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <GqlMockedProvider<{
          StaffAccount: StaffAccountQuery;
        }>
          mocks={mockStaffAccount}
          onCall={mutationSpy}
        >
          <MockStaffSavingFundProvider>
            <StaffSavingFundLayout pageTitle={title} selectedMenuId={id}>
              <div>Test Children</div>
            </StaffSavingFundLayout>
          </MockStaffSavingFundProvider>
        </GqlMockedProvider>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('StaffSavingFundLayout', () => {
  it('renders children with staff account', async () => {
    const { findByText } = render(<Components />);
    expect(await findByText('Test Children')).toBeInTheDocument();
  });

  it('should open nav list', async () => {
    const { findByText } = render(<Components />);
    expect(await findByText(/donation/i)).toBeInTheDocument();
    expect(await findByText(/reports/i)).toBeInTheDocument();
  });

  it('renders no staff account page when no staff account', async () => {
    const mockNoStaffAccount = {
      StaffAccount: {
        staffAccount: null,
      },
    };
    const { findByText } = render(
      <GqlMockedProvider<{
        StaffAccount: StaffAccountQuery;
      }>
        mocks={mockNoStaffAccount}
        onCall={mutationSpy}
      >
        <MockStaffSavingFundProvider>
          <StaffSavingFundLayout pageTitle={title} selectedMenuId={id}>
            <div>Test Children</div>
          </StaffSavingFundLayout>
        </MockStaffSavingFundProvider>
      </GqlMockedProvider>,
    );
    expect(
      await findByText(/access to this feature is limited/i),
    ).toBeInTheDocument();
  });
});
