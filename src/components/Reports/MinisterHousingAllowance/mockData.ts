import { MhaStatusEnum } from 'src/graphql/types.generated';
import { MinistryHousingAllowanceRequestsQuery } from './MinisterHousingAllowance.generated';

export const mockMHARequest: MinistryHousingAllowanceRequestsQuery['ministryHousingAllowanceRequests']['nodes'][0] =
  {
    id: '1',
    personNumber: '123456',
    status: MhaStatusEnum.Pending,
    feedback: null,
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
    },
    requestAttributes: {
      approvedOverallAmount: 1500,
      submittedDate: '2023-08-23',
      deadlineDate: '2023-09-17',
      boardApprovedDate: '2023-10-01',
      availableDate: '2024-01-01',
      rentOrOwn: null,
      rentalValue: null,
      furnitureCostsOne: null,
      avgUtilityOne: null,
      mortgageOrRentPayment: null,
      furnitureCostsTwo: null,
      repairCosts: null,
      avgUtilityTwo: null,
      unexpectedExpenses: null,
      overallAmount: null,
      phoneNumber: null,
      emailAddress: null,
      iUnderstandMhaPolicy: null,
      approvedDate: null,
      lastApprovedDate: null,
      spouseSpecific: null,
      staffSpecific: null,
    },
  };
