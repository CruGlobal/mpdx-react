import { MockedResponse } from '@apollo/client/testing';
import {
  ContactsDocument,
  ContactsQuery,
  ContactsQueryVariables,
} from '../../../../pages/accountLists/[accountListId]/Contacts.generated';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';

export const ContactsQueryDefaultMocks = (
  accountListId: string,
): MockedResponse[] => {
  const contactsQuery = gqlMock<ContactsQuery, ContactsQueryVariables>(
    ContactsDocument,
    {
      variables: { accountListId },
    },
  );

  return [
    {
      request: {
        query: ContactsDocument,
        variables: {
          accountListId,
        },
      },
      result: {
        data: contactsQuery,
      },
    },
  ];
};

export const ContactsQueryEmptyMocks = (
  accountListId: string,
): MockedResponse[] => {
  return [
    {
      request: {
        query: ContactsDocument,
        variables: {
          accountListId,
        },
      },
      result: {
        data: { contacts: { nodes: [] } },
      },
    },
  ];
};

export const ContactsQueryLoadingMocks = (
  accountListId: string,
): MockedResponse[] => {
  return [
    {
      ...ContactsQueryDefaultMocks(accountListId)[0],
      delay: 100931731455,
    },
  ];
};
