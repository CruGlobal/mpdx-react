import { MockedResponse } from '@apollo/client/testing';
import { GetTopBarDocument, GetTopBarQuery } from './GetTopBar.generated';

export const getTopBarMock = (): MockedResponse => {
  const data: GetTopBarQuery = {
    accountLists: {
      nodes: [{ id: '1', name: 'Staff Account' }],
    },
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Smith',
      admin: true,
      developer: true,
      keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
      administrativeOrganizations: {
        nodes: [{ id: '1' }],
      },
    },
  };
  return {
    request: {
      query: GetTopBarDocument,
    },
    result: {
      data,
    },
  };
};

export const getTopBarMockWithMultipleAccountLists = (): MockedResponse => {
  const data: GetTopBarQuery = {
    accountLists: {
      nodes: [
        { id: '1', name: 'Staff Account' },
        { id: '2', name: 'Other Account' },
      ],
    },
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Smith',
      admin: true,
      developer: true,
      keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
      administrativeOrganizations: {
        nodes: [{ id: '1' }],
      },
    },
  };
  return {
    request: {
      query: GetTopBarDocument,
    },
    result: {
      data,
    },
  };
};

export const getTopBarMultipleMock = (): MockedResponse => {
  const data: GetTopBarQuery = {
    accountLists: {
      nodes: [
        { id: '1', name: 'Staff Account' },
        { id: '2', name: 'Ministry Account' },
      ],
    },
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Smith',
      admin: false,
      developer: false,
      keyAccounts: [{ id: '1', email: 'john.smith@gmail.com' }],
      administrativeOrganizations: {
        nodes: [],
      },
    },
  };
  return {
    request: {
      query: GetTopBarDocument,
    },
    result: {
      data,
    },
  };
};
