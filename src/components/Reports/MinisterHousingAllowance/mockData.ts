import { MhaStatusEnum } from 'src/graphql/types.generated';
import { MHARequest } from './SharedComponents/types';

export const mockMHARequest: MHARequest = {
  id: '1',
  personNumber: '123456',
  updatedAt: '2019-09-15T12:00:00.000Z',
  status: MhaStatusEnum.Pending,
  feedback: null,
  user: {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
  },
  requestAttributes: {
    approvedOverallAmount: 15000,
    submittedAt: '2019-10-01T15:30:45.123Z',
    deadlineDate: '2019-10-23T15:30:45.123Z',
    boardApprovedAt: '2019-10-30T15:30:45.123Z',
    availableDate: '2019-11-20T15:30:45.123Z',
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
    hrApprovedAt: '2019-11-01T15:30:45.123Z',
    spouseSpecific: null,
    staffSpecific: 15000,
    changesRequestedAt: null,
  },
};
