import { MockedResponse } from '@apollo/client/testing';
import {
  ContactFiltersDocument,
  ContactFiltersQuery,
  ContactFiltersQueryVariables,
} from '../../../../pages/accountLists/[accountListId]/ContactFilters.generated';
import { gqlMock } from '../../../../__tests__/util/graphqlMocking';

export const ContactFiltersQueryDefaultMocks = (
  accountListId: string,
): MockedResponse[] => {
  const contactFiltersQuery = gqlMock<
    ContactFiltersQuery,
    ContactFiltersQueryVariables
  >(ContactFiltersDocument, { variables: { accountListId } });

  return [
    {
      request: {
        query: ContactFiltersDocument,
        variables: {
          accountListId,
        },
      },
      result: {
        data: contactFiltersQuery,
      },
    },
  ];
};

export const ContactFiltersQueryEmptyMocks = (
  accountListId: string,
): MockedResponse[] => {
  return [
    {
      request: {
        query: ContactFiltersDocument,
        variables: {
          accountListId,
        },
      },
      result: {
        data: { contactFilters: [] },
      },
    },
  ];
};

export const ContactFiltersQueryLoadingMocks = (
  accountListId: string,
): MockedResponse[] => {
  return [
    {
      ...ContactFiltersQueryDefaultMocks(accountListId)[0],
      delay: 100931731455,
    },
  ];
};
