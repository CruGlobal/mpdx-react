export interface PersonInfo {
  id: string;
  name: string;
  age: number;
  tenure: number;
  location: string;
  children: number | null;
  email: string;
  phone: string;
  eligibleForMHA?: boolean; // temporary field for testing purposes
}

interface MHA {
  approvedOverallAmount: number | null;
  lastApprovedDate: string | null;
  approvedSpecificAmount: number | null;
  deadlineDate: string | null;
  boardApprovalDate: string | null;
  approvedDate: string | null;
  submittedDate: string | null;
  availableDate: string | null;
}

interface MhaDetails {
  staffMHA: MHA | null;
  spouseMHA?: MHA | null;
}

interface Retirement {
  taxDeferredPercentage: number;
  rothPercentage: number;
  maximumContributionLimit: number;
}

interface RetirementDetails {
  staff: Retirement;
  spouse?: Retirement;
}

interface SalaryCap {
  capAmount: number;
  effectiveDate: string;
  approver: string;
}

interface CurrentSalary {
  currentGross: number;
  lastUpdated: string;
  grossSalaryAmount: number;
}

interface Mock {
  staffInfo: PersonInfo;
  spouseInfo: PersonInfo | null;
  mhaDetails: MhaDetails;
  retirementDetails: RetirementDetails;
  salaryCap: SalaryCap | null;
  minimumSalary: number;
  maximumSalary: number;
  currentSalary: CurrentSalary;
}

export const mocks: Mock[] = [
  // not married, no mha pending, and no approved mha
  {
    staffInfo: {
      id: '000123456',
      name: 'Doe, John',
      age: 35,
      tenure: 10,
      location: 'Dallas, Texas',
      children: null,
      email: 'john.doe@cru.org',
      phone: '1234567890',
    },
    spouseInfo: null,
    mhaDetails: {
      staffMHA: null,
    },
    retirementDetails: {
      staff: {
        taxDeferredPercentage: 5,
        rothPercentage: 3,
        maximumContributionLimit: 19500,
      },
    },
    salaryCap: {
      capAmount: 60000,
      effectiveDate: '2022-06-01',
      approver: 'Jane Smith',
    },
    minimumSalary: 40000,
    maximumSalary: 80000,
    currentSalary: {
      currentGross: 55000,
      lastUpdated: '2023-03-01',
      grossSalaryAmount: 55000,
    },
  },
  // married, no mha pending, and no approved mha
  {
    staffInfo: {
      id: '000123456',
      name: 'Doe, John',
      age: 35,
      tenure: 10,
      location: 'Dallas, Texas',
      children: null,
      email: 'john.doe@cru.org',
      phone: '1234567890',
    },
    spouseInfo: {
      id: '100123456',
      name: 'Doe, Jane',
      age: 33,
      tenure: 8,
      location: 'Dallas, Texas',
      children: 2,
      email: 'jane.doe@cru.org',
      phone: '1234567891',
      eligibleForMHA: false,
    },
    mhaDetails: {
      staffMHA: null,
      spouseMHA: null,
    },
    retirementDetails: {
      staff: {
        taxDeferredPercentage: 6,
        rothPercentage: 4,
        maximumContributionLimit: 19500,
      },
      spouse: {
        taxDeferredPercentage: 5,
        rothPercentage: 5,
        maximumContributionLimit: 19500,
      },
    },
    salaryCap: null,
    minimumSalary: 40000,
    maximumSalary: 80000,
    currentSalary: {
      currentGross: 60000,
      lastUpdated: '2023-04-01',
      grossSalaryAmount: 60000,
    },
  },
  // married, no mha pending, and approved mha
  {
    staffInfo: {
      id: '000123456',
      name: 'Doe, John',
      age: 35,
      tenure: 10,
      location: 'Dallas, Texas',
      children: 2,
      email: 'john.doe@cru.org',
      phone: '1234567890',
    },
    spouseInfo: {
      id: '100123456',
      name: 'Doe, Jane',
      age: 33,
      tenure: 8,
      location: 'Dallas, Texas',
      children: 2,
      email: 'jane.doe@cru.org',
      phone: '1234567891',
    },
    mhaDetails: {
      staffMHA: {
        approvedOverallAmount: 19400,
        lastApprovedDate: '2023-02-15',
        approvedSpecificAmount: 10000,
        deadlineDate: null,
        boardApprovalDate: '2023-03-01',
        approvedDate: '2024-09-01',
        submittedDate: '2023-02-20',
        availableDate: '2023-03-10',
      },
      spouseMHA: {
        approvedOverallAmount: 19400,
        lastApprovedDate: '2023-02-16',
        approvedSpecificAmount: 9400,
        deadlineDate: null,
        boardApprovalDate: '2023-03-02',
        approvedDate: '2024-09-01',
        submittedDate: '2023-02-20',
        availableDate: '2023-03-11',
      },
    },
    retirementDetails: {
      staff: {
        taxDeferredPercentage: 6,
        rothPercentage: 4,
        maximumContributionLimit: 19500,
      },
      spouse: {
        taxDeferredPercentage: 5,
        rothPercentage: 5,
        maximumContributionLimit: 19500,
      },
    },
    salaryCap: {
      capAmount: 65000,
      effectiveDate: '2022-07-01',
      approver: 'Jane Smith',
    },
    minimumSalary: 40000,
    maximumSalary: 80000,
    currentSalary: {
      currentGross: 62000,
      lastUpdated: '2023-05-01',
      grossSalaryAmount: 62000,
    },
  },
  // single, no mha pending, and approved mha
  {
    staffInfo: {
      id: '000123456',
      name: 'Doe, John',
      age: 35,
      tenure: 10,
      location: 'Dallas, Texas',
      children: 2,
      email: 'john.doe@cru.org',
      phone: '1234567890',
    },
    spouseInfo: null,
    mhaDetails: {
      staffMHA: {
        approvedOverallAmount: 19400,
        lastApprovedDate: '2023-02-15',
        approvedSpecificAmount: 19400,
        deadlineDate: null,
        boardApprovalDate: '2023-03-01',
        approvedDate: '2024-09-01',
        submittedDate: '2023-02-20',
        availableDate: '2023-03-10',
      },
      spouseMHA: null,
    },
    retirementDetails: {
      staff: {
        taxDeferredPercentage: 6,
        rothPercentage: 4,
        maximumContributionLimit: 19500,
      },
      spouse: {
        taxDeferredPercentage: 5,
        rothPercentage: 5,
        maximumContributionLimit: 19500,
      },
    },
    salaryCap: {
      capAmount: 65000,
      effectiveDate: '2022-07-01',
      approver: 'Jane Smith',
    },
    minimumSalary: 40000,
    maximumSalary: 80000,
    currentSalary: {
      currentGross: 62000,
      lastUpdated: '2023-05-01',
      grossSalaryAmount: 62000,
    },
  },
  // married, mha pending, and no approved mha
  {
    staffInfo: {
      id: '000123456',
      name: 'Doe, John',
      age: 35,
      tenure: 10,
      location: 'Dallas, Texas',
      children: 2,
      email: 'john.doe@cru.org',
      phone: '1234567890',
    },
    spouseInfo: {
      id: '100123456',
      name: 'Doe, Jane',
      age: 33,
      tenure: 8,
      location: 'Dallas, Texas',
      children: 2,
      email: 'jane.doe@cru.org',
      phone: '1234567891',
    },
    mhaDetails: {
      staffMHA: {
        approvedOverallAmount: 19400,
        lastApprovedDate: '2025-08-23',
        approvedSpecificAmount: null,
        deadlineDate: '2025-09-17',
        boardApprovalDate: '2025-10-01',
        approvedDate: null,
        submittedDate: '2025-08-20',
        availableDate: '2026-01-01',
      },
      spouseMHA: {
        approvedOverallAmount: 19400,
        lastApprovedDate: '2025-08-23',
        approvedSpecificAmount: null,
        deadlineDate: '2025-09-17',
        boardApprovalDate: '2025-10-01',
        approvedDate: null,
        submittedDate: '2025-08-20',
        availableDate: '2026-01-01',
      },
    },
    retirementDetails: {
      staff: {
        taxDeferredPercentage: 6,
        rothPercentage: 4,
        maximumContributionLimit: 19500,
      },
      spouse: {
        taxDeferredPercentage: 5,
        rothPercentage: 5,
        maximumContributionLimit: 19500,
      },
    },
    salaryCap: null,
    minimumSalary: 40000,
    maximumSalary: 80000,
    currentSalary: {
      currentGross: 60000,
      lastUpdated: '2023-04-01',
      grossSalaryAmount: 60000,
    },
  },
];
