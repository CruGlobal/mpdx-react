import { ApolloError } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { isHcmPersonNotFoundError } from './hcmPersonNotFound';

const apolloError = (code: string) =>
  new ApolloError({
    graphQLErrors: [
      new GraphQLError('HCM person not found', { extensions: { code } }),
    ],
  });

describe('isHcmPersonNotFoundError', () => {
  it('is true for an HCM_PERSON_NOT_FOUND error', () => {
    expect(isHcmPersonNotFoundError(apolloError('HCM_PERSON_NOT_FOUND'))).toBe(
      true,
    );
  });

  it('is false for other errors', () => {
    expect(isHcmPersonNotFoundError(apolloError('HCM_UNAVAILABLE'))).toBe(
      false,
    );
    expect(
      isHcmPersonNotFoundError(
        new ApolloError({ networkError: new Error('offline') }),
      ),
    ).toBe(false);
  });

  it('is false without an error', () => {
    expect(isHcmPersonNotFoundError(undefined)).toBe(false);
  });
});
