import { GraphQLScalarType } from 'graphql';
import { Resolvers } from '../graphql-rest.page.generated';

const ISO8601DateScalar = new GraphQLScalarType({
  name: 'ISO8601Date',
  description: 'An ISO 8601-encoded date',
});

const ISO8601DateTimeScalar = new GraphQLScalarType({
  name: 'ISO8601DateTime',
  description: 'An ISO 8601-encoded date time',
});

export const ScalarResolvers: Resolvers = {
  Query: {
    ISO8601Date: ISO8601DateScalar,
    ISO8601DateTime: ISO8601DateTimeScalar,
  },
};
