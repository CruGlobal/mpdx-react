import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import Rollbar from 'rollbar';
import { addGraphQLErrorsToRollbarItem } from './rollbar';

describe('addGraphQLErrorsToRollbarItem', () => {
  it('adds the GraphQL errors to the custom data', () => {
    const data: Rollbar.Dictionary = { custom: { existing: 'value' } };
    const err = new ApolloError({
      graphQLErrors: [
        new GraphQLError('HCM UserInfo report unavailable', {
          path: ['updateSalaryRequest', 'salaryRequest'],
          extensions: {
            code: 'HCM_UNAVAILABLE',
            staffAccountId: '123',
            personNumber: '456',
          },
        }),
      ],
    });

    addGraphQLErrorsToRollbarItem(data, { err });

    expect(data.custom).toEqual({
      existing: 'value',
      graphQLErrors: [
        {
          message: 'HCM UserInfo report unavailable',
          path: 'updateSalaryRequest.salaryRequest',
          extensions: {
            code: 'HCM_UNAVAILABLE',
            staffAccountId: '123',
            personNumber: '456',
          },
        },
      ],
    });
  });

  it('leaves the data alone for an ApolloError without GraphQL errors', () => {
    const data: Rollbar.Dictionary = {};
    const err = new ApolloError({ networkError: new Error('Failed to fetch') });

    addGraphQLErrorsToRollbarItem(data, { err });

    expect(data).toEqual({});
  });

  it('leaves the data alone for other errors', () => {
    const data: Rollbar.Dictionary = {};

    addGraphQLErrorsToRollbarItem(data, { err: new Error('Something broke') });

    expect(data).toEqual({});
  });
});
