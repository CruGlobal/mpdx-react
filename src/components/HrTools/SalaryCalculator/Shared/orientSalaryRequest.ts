import type {
  SalaryRequest,
  SalaryRequestCalculations,
} from 'src/graphql/types.generated';

type SwappableSalaryRequest = Partial<
  Pick<
    SalaryRequest,
    | 'personNumber'
    | 'salary'
    | 'spouseSalary'
    | 'mhaAmount'
    | 'spouseMhaAmount'
    | 'salaryCap'
    | 'spouseSalaryCap'
  >
> & {
  calculations?: Partial<SalaryRequestCalculations> | null;
  spouseCalculations?: Partial<SalaryRequestCalculations> | null;
};

/**
 * The database stores salary requests from the perspective of the person who created it. This
 * helper detects when the request was created by the spouse and swaps the fields to be from the
 * user's perspective.
 */
export const orientSalaryRequest = <Request extends SwappableSalaryRequest>(
  request: Request | null | undefined,
  userPersonNumber: string | null | undefined,
): Request | null | undefined => {
  if (
    !request?.personNumber ||
    !userPersonNumber ||
    request.personNumber === userPersonNumber
  ) {
    return request;
  }

  // The person number of the request doesn't match the user's person number, so swap the fields
  return {
    ...request,
    personNumber: userPersonNumber,
    salary: request.spouseSalary,
    spouseSalary: request.salary,
    mhaAmount: request.spouseMhaAmount,
    spouseMhaAmount: request.mhaAmount,
    salaryCap: request.spouseSalaryCap,
    spouseSalaryCap: request.salaryCap,
    calculations: request.spouseCalculations,
    spouseCalculations: request.calculations,
  };
};
