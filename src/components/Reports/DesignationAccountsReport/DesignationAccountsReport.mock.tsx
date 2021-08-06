import { MockedResponse } from '@apollo/client/testing';
import {
  DesignationAccountsDocument,
  DesignationAccountsQuery,
} from './GetDesignationAccounts.generated';

export const designationAccountsMock = (
  accountListId: string,
): MockedResponse => {
  const data: DesignationAccountsQuery = {
    designationAccounts: [
      {
        organizationName: 'test org 01',
        balance: 3255,
        designationAccounts: [
          {
            active: false,
            id: 'test-id-111',
            balanceUpdatedAt: '2/2/2021',
            convertedBalance: 3500,
            currency: 'CAD',
            designationNumber: '33221',
            name: 'Test Account',
          },
        ],
      },
    ],
  };
  return {
    request: {
      query: DesignationAccountsDocument,
      variables: {
        accountListId,
      },
    },
    result: {
      data,
    },
  };
};

export const designationAccountsEmptyMock = (
  accountListId: string,
): MockedResponse => {
  return {
    request: {
      query: DesignationAccountsDocument,
      variables: {
        accountListId,
      },
    },
    result: {
      data: {
        designationAccounts: [],
      },
    },
  };
};

export const designationAccountsLoadingMock = (
  accountListId: string,
): MockedResponse => {
  return {
    ...designationAccountsMock(accountListId),
    delay: 100931731455,
  };
};

export const designationAccountsErrorMock = (
  accountListId: string,
): MockedResponse => {
  return {
    request: {
      query: DesignationAccountsDocument,
      variables: {
        accountListId,
      },
    },
    error: { name: 'error', message: 'Error loading data.  Try again.' },
  };
};
