import { StaffInfo } from 'src/graphql/types.generated';
import { HcmDataQuery } from './HCMData.generated';

const johnDoe: StaffInfo = {
  id: `ID000000`,
  personNumber: `000123456`,
  firstName: `John`,
  lastName: `Doe`,
  preferredName: `John`,
  age: 35,
  tenure: 10,
  addressLine1: '100 Lake Hart Dr',
  addressLine2: '',
  city: 'Orlando',
  state: 'FL',
  zipCode: '32832',
  country: 'USA',
  dependentChildrenWithHealthcareBenefits: null,
  secaStatus: null,
  emailAddress: 'john.doe@cru.org',
  primaryPhoneNumber: '1234567890',
  assignmentId: 'assignment-000123456',
  userPersonType: null,
  peopleGroupSupportType: null,
  assignmentStatus: null,
  assignmentCategory: null,
};

const janeDoe: StaffInfo = {
  ...johnDoe,
  id: `ID111111`,
  personNumber: `000789123`,
  firstName: `Jane`,
  preferredName: `Jane`,
  age: 35,
  tenure: 3,
  emailAddress: 'jane.doe@cru.org',
  primaryPhoneNumber: '9876543210',
  assignmentId: 'assignment-000789123',
};

const noMhaAndNoException: HcmDataQuery['hcm'][0] = {
  staffInfo: johnDoe,
  mhaRequest: {
    currentApprovedOverallAmount: null,
    lastUpdatedDate: null,
    currentApprovedAmountForStaff: null,
  },
  exceptionSalaryCap: {
    amount: null,
    effectiveDate: null,
    exceptionApprover: null,
  },
  fourOThreeB: {
    currentTaxDeferredContributionPercentage: 6,
    currentRothContributionPercentage: 4,
    maximumContributionLimit: 19500,
  },
  currentSalary: {
    lastUpdated: '2023-04-01',
    grossSalaryAmount: 60000,
  },
};

const mhaAndNoException: HcmDataQuery['hcm'][0] = {
  ...noMhaAndNoException,
  mhaRequest: {
    currentApprovedOverallAmount: 15000,
    lastUpdatedDate: '2023-01-15',
    currentApprovedAmountForStaff: 10000,
  },
};

const mhaAndException: HcmDataQuery['hcm'][0] = {
  ...mhaAndNoException,
  exceptionSalaryCap: {
    amount: 95000,
    effectiveDate: '2025-11-15',
    exceptionApprover: 'Mr Smith',
  },
};

export const singleNoMhaNoException: HcmDataQuery['hcm'] = [
  noMhaAndNoException,
];
export const singleMhaNoException: HcmDataQuery['hcm'] = [mhaAndNoException];
export const singleMhaAndException: HcmDataQuery['hcm'] = [mhaAndException];
export const marriedNoMhaAndNoException: HcmDataQuery['hcm'] = [
  noMhaAndNoException,
  {
    ...noMhaAndNoException,
    staffInfo: janeDoe,
  },
];
export const marriedMhaAndNoException: HcmDataQuery['hcm'] = [
  mhaAndNoException,
  {
    ...mhaAndNoException,
    staffInfo: janeDoe,
  },
];
export const marriedNoMhaNoException: HcmDataQuery['hcm'] = [
  noMhaAndNoException,
  {
    ...noMhaAndNoException,
    staffInfo: janeDoe,
  },
];
