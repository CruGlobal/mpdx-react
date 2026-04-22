import { HcmQuery } from './Hcm.generated';

const johnDoe: HcmQuery['hcm'][number]['staffInfo'] = {
  id: `ID000000`,
  personNumber: `000123456`,
  firstName: `John`,
  lastName: `Doe`,
  preferredName: `John`,
  age: 35,
  addressLine1: '100 Lake Hart Dr',
  addressLine2: '',
  city: 'Orlando',
  country: 'US',
  state: 'FL',
  zipCode: '32832',
  dependentChildrenWithHealthcareBenefits: null,
  secaStatus: null,
  emailAddress: 'john.doe@cru.org',
  primaryPhoneNumber: '1234567890',
};

const janeDoe: HcmQuery['hcm'][number]['staffInfo'] = {
  ...johnDoe,
  id: `ID111111`,
  personNumber: `000789123`,
  firstName: `Jane`,
  preferredName: `Jane`,
  age: 35,
  emailAddress: 'jane.doe@cru.org',
  primaryPhoneNumber: '9876543210',
};

const noMhaAndNoException: HcmQuery['hcm'][number] = {
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
    boardCapException: false,
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

const ineligibleAndNoException: HcmQuery['hcm'][number] = {
  ...noMhaAndNoException,
  mhaEit: {
    mhaEligibility: false,
  },
};

const mhaAndNoException: HcmQuery['hcm'][number] = {
  ...noMhaAndNoException,
  mhaRequest: {
    currentApprovedOverallAmount: 15000,
    currentTakenAmount: 10000,
  },
};

export const singleNoMhaNoException: HcmQuery['hcm'] = [noMhaAndNoException];
export const singleMhaNoException: HcmQuery['hcm'] = [mhaAndNoException];
export const marriedMhaAndNoException: HcmQuery['hcm'] = [
  mhaAndNoException,
  {
    ...mhaAndNoException,
    staffInfo: janeDoe,
  },
];
export const marriedNoMhaNoException: HcmQuery['hcm'] = [
  noMhaAndNoException,
  {
    ...noMhaAndNoException,
    staffInfo: janeDoe,
  },
];
export const singleIneligible: HcmQuery['hcm'] = [ineligibleAndNoException];
export const marriedBothIneligible: HcmQuery['hcm'] = [
  ineligibleAndNoException,
  {
    ...ineligibleAndNoException,
    staffInfo: janeDoe,
  },
];
export const marriedUserIneligibleSpouseEligible: HcmQuery['hcm'] = [
  ineligibleAndNoException,
  {
    ...noMhaAndNoException,
    staffInfo: janeDoe,
  },
];
export const marriedUserEligibleSpouseIneligible: HcmQuery['hcm'] = [
  noMhaAndNoException,
  {
    ...ineligibleAndNoException,
    staffInfo: janeDoe,
  },
];
