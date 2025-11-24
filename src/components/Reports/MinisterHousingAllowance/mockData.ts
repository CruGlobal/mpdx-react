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
      approvedOverallAmount: 15000,
      submittedDate: '2025-10-01T15:30:45.123Z',
      deadlineDate: '2025-10-23T15:30:45.123Z',
      boardApprovedDate: '2025-10-30T15:30:45.123Z',
      availableDate: '2025-11-20T15:30:45.123Z',
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
      iUnderstandMhaPolicy: true,
      approvedDate: '2025-11-01T15:30:45.123Z',
      lastApprovedDate: '2025-11-01T15:30:45.123Z',
      spouseSpecific: null,
      staffSpecific: 15000,
    },
  };
