import { createElement } from 'react';
import { renderHook } from '@testing-library/react';
import { Formik } from 'formik';
import { ElectionType403bEnum } from 'src/graphql/types.generated';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { useSalaryCalculations } from './useSalaryCalculations';

// useSalaryCalculations.test.ts is past the test file size limit, so the combined cap
// wiring is tested here with the same setup.
jest.mock('./AdditionalSalaryRequestContext');

const mockUseAdditionalSalaryRequest =
  useAdditionalSalaryRequest as jest.MockedFunction<
    typeof useAdditionalSalaryRequest
  >;

// The requester asks for $10,000, which takes them $10,000 over their cap, while their spouse
// still has $10,000 of room. Together they request $100,000.
const mockRequest = (combinedCap: number | null) =>
  mockUseAdditionalSalaryRequest.mockReturnValue({
    traditional403bPercentage: 0,
    roth403bPercentage: 0,
    spouse: { asrEit: { asrEligibility: true } },
    requestData: {
      latestAdditionalSalaryRequest: {
        calculations: {
          grossAnnualSalary: 50000,
          currentSalaryCap: 50000,
          ytdAsrAmount: 0,
          combinedCap,
        },
        spouseCalculations: {
          grossAnnualSalary: 40000,
          currentSalaryCap: 50000,
          ytdAsrAmount: 0,
        },
      },
    },
  } as unknown as ReturnType<typeof useAdditionalSalaryRequest>);

const values: CompleteFormValues = {
  currentYearSalaryNotReceived: '0',
  previousYearSalaryNotReceived: '0',
  additionalSalaryWithinMax: '10000',
  adoption: '0',
  counselingNonMedical: '0',
  healthcareExpensesExceedingLimit: '0',
  babysittingMinistryEvents: '0',
  childrenMinistryTripExpenses: '0',
  childrenCollegeEducation: '0',
  movingExpense: '0',
  seminary: '0',
  housingDownPayment: '0',
  autoPurchase: '0',
  expensesNotApprovedWithin90Days: '0',
  electionType403b: ElectionType403bEnum.None,
  phoneNumber: '',
  emailAddress: '',
  totalAdditionalSalaryRequested: '0',
  additionalInfo: '',
};

const renderUseSalaryCalculations = () =>
  renderHook(() => useSalaryCalculations({ values }), {
    wrapper: ({ children }) =>
      createElement(
        Formik,
        { initialValues: values, onSubmit: () => {} },
        children,
      ),
  });

describe('useSalaryCalculations combined cap', () => {
  it('asks for a split while the couple is under the combined cap', () => {
    mockRequest(100000);

    const { result } = renderUseSalaryCalculations();

    expect(result.current.splitAsrType).toBe('user');
  });

  // MPDX-10360: a couple over the combined cap goes to the normal approval levels
  it('does not ask for a split when the couple is over the combined cap', () => {
    mockRequest(99999.99);

    const { result } = renderUseSalaryCalculations();

    expect(result.current.exceedsCap).toBe(true);
    expect(result.current.splitAsr).toBe(false);
  });

  it('asks for a split when the combined cap is unknown', () => {
    mockRequest(null);

    const { result } = renderUseSalaryCalculations();

    expect(result.current.splitAsrType).toBe('user');
  });
});
