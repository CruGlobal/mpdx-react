import { HcmDataQuery } from './HCMData.generated';

const johnDoe: HcmDataQuery['hcm'][number]['staffInfo'] = {
  id: `ID000000`,
  personNumber: `000123456`,
  firstName: `John`,
  lastName: `Doe`,
  preferredName: `John`,
  age: 35,
  addressLine1: '100 Lake Hart Dr',
  addressLine2: '',
  city: 'Orlando',
  state: 'FL',
  zipCode: '32832',
  dependentChildrenWithHealthcareBenefits: null,
  secaStatus: null,
  emailAddress: 'john.doe@cru.org',
  primaryPhoneNumber: '1234567890',
};

const janeDoe: HcmDataQuery['hcm'][number]['staffInfo'] = {
  ...johnDoe,
  id: `ID111111`,
  personNumber: `000789123`,
  firstName: `Jane`,
  preferredName: `Jane`,
  age: 35,
  emailAddress: 'jane.doe@cru.org',
  primaryPhoneNumber: '9876543210',
};

const noMhaAndNoException: HcmDataQuery['hcm'][number] = {
  salaryRequestEligible: true,
  staffInfo: johnDoe,
  mhaRequest: {
    currentApprovedOverallAmount: null,
    currentTakenAmount: null,
  },
  mhaEit: {
    mhaEligibility: true,
  },
  asrEit: {
    asrEligibility: true,
  },
  exceptionSalaryCap: {
    amount: null,
    effectiveDate: null,
  },
  fourOThreeB: {
    currentTaxDeferredContributionPercentage: 6,
    currentRothContributionPercentage: 4,
    maximumContributionLimit: 19500,
  },
  currentSalary: {
    lastUpdated: '2023-04-01',
    grossSalaryAmount: 60000,
    lastRegularPaymentDate: null,
  },
};

const mhaAndNoException: HcmDataQuery['hcm'][number] = {
  ...noMhaAndNoException,
  mhaRequest: {
    currentApprovedOverallAmount: 15000,
    currentTakenAmount: 10000,
  },
};

export const singleNoMhaNoException: HcmDataQuery['hcm'] = [
  noMhaAndNoException,
];
export const singleMhaNoException: HcmDataQuery['hcm'] = [mhaAndNoException];
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
