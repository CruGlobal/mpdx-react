import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { PageEnum } from 'src/components/Reports/Shared/CalculationReports/Shared/sharedTypes';
import theme from 'src/theme';
import { DeleteMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import { MinisterHousingAllowanceProvider } from '../../Shared/Context/MinisterHousingAllowanceContext';
import { AboutForm } from './AboutForm';

const mutationSpy = jest.fn();
const mockEnqueue = jest.fn();
const mockPush = jest.fn();
const submit = jest.fn();
const boardApprovedAt = '2024-09-15';
const availabilityDate = '2024-10-01';

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

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter
        router={{ push: mockPush, query: { accountListId: 'account-list-1' } }}
      >
        <GqlMockedProvider<{
          DeleteMinistryHousingAllowanceRequest: DeleteMinistryHousingAllowanceRequestMutation;
        }>
          onCall={mutationSpy}
        >
          <MinisterHousingAllowanceProvider
            requestId="request-id"
            type={PageEnum.New}
          >
            <Formik initialValues={{}} onSubmit={submit}>
              <AboutForm
                boardApprovedAt={boardApprovedAt}
                availableDate={availabilityDate}
              />
            </Formik>
          </MinisterHousingAllowanceProvider>
        </GqlMockedProvider>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('AboutForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form and formatted dates', async () => {
    const { getByText, getByRole, findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
    expect(
      getByText(
        /a minister's housing allowance request is a form ministers complete/i,
      ),
    ).toBeInTheDocument();
    expect(getByText(/9\/15\/2024/)).toBeInTheDocument();
    expect(getByText(/10\/1\/2024/)).toBeInTheDocument();

    expect(getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('should go to salary calculator link when clicked', () => {
    const { getByText } = render(<TestComponent />);

    const salaryLink = getByText('Salary Calculation Form');
    expect(salaryLink).toHaveAttribute(
      'href',
      '/accountLists/account-list-1/reports/salaryCalculator',
    );
  });

  it('should show discard modal when Discard is clicked', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const discard = await findByRole('button', { name: /discard/i });

    userEvent.click(discard);

    await waitFor(() => {
      expect(
        getByRole('heading', {
          name: 'Do you want to discard?',
        }),
      ).toBeInTheDocument();
    });

    const confirmDiscard = getByRole('button', { name: /yes, discard/i });
    userEvent.click(confirmDiscard);

    await waitFor(() => {
      expect(mutationSpy).toHaveGraphqlOperation(
        'DeleteMinistryHousingAllowanceRequest',
        {
          input: {
            requestId: 'request-id',
          },
        },
      );
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('Request discarded successfully.'),
        { variant: 'success' },
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        `/accountLists/account-list-1/reports/housingAllowance`,
      );
    });
  });
});
