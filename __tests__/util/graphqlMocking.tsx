import React, { PropsWithChildren, ReactElement } from 'react';
import { addTypenameToDocument } from '@apollo/client/utilities';
import { mergeSchemas } from '@graphql-tools/schema';
import {
  DocumentNode,
  ExecutionResult,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  buildASTSchema,
  isSchema,
} from 'graphql';
import {
  ErgonoMockedProvider,
  ErgonoMockedProviderProps,
  ErgonomockOptions,
  ergonomock,
} from 'graphql-ergonomock';
import { DefaultMockResolvers } from 'graphql-ergonomock/dist/mock';
import { gql } from 'graphql-tag';
import seedrandom from 'seedrandom';
import { DeepPartial } from 'ts-essentials';
import schema from 'src/graphql/schema.graphql';
import { createCache } from 'src/lib/apollo/cache';

const seed = 'seed';
const rng = seedrandom(seed);

const resolvers: DefaultMockResolvers = {
  ISO8601DateTime: () =>
    // Time in 2022
    new Date(
      1641016800000 /* Jan 1, 2022 */ + Math.floor(rng() * 365 * 86400) * 1000,
    ).toISOString(),
  ISO8601Date: () =>
    // Date in 2022
    new Date(
      1641016800000 /* Jan 1, 2022 */ + Math.floor(rng() * 365) * 86400 * 1000,
    )
      .toISOString()
      .slice(0, 10),
};

export const GqlMockedProvider = <TData,>({
  children,
  mocks,
  cache = createCache(),
  ...props
}: PropsWithChildren<
  Omit<ErgonoMockedProviderProps, 'schema'> & {
    mocks?: DeepPartial<TData>;
  }
>): ReactElement => (
  <ErgonoMockedProvider
    {...props}
    mocks={mocks}
    cache={cache}
    schema={schema}
    resolvers={resolvers}
  >
    {children}
  </ErgonoMockedProvider>
);

// Adapted from https://github.com/smooth-code/fraql/blob/65674bc6a7f523ea3b20d8ecd34007a820cf5c67/src/mock.js#L16-L43
const generateSchemaWithFragmentsAsQueries = (): GraphQLSchema => {
  const originalSchema = buildASTSchema(schema);
  if (!isSchema(originalSchema)) {
    throw new Error('generateSchemaWithFragmentsAsQueries: Schema invalid');
  }
  const typeMap = originalSchema.getTypeMap();
  const fields = Object.keys(typeMap).reduce((fields, typeName) => {
    const type = typeMap[typeName];
    if (
      typeName.startsWith('__') ||
      typeName === 'Query' ||
      (!(type instanceof GraphQLObjectType) &&
        !(type instanceof GraphQLInterfaceType))
    ) {
      return fields;
    }
    return {
      ...fields,
      [`fraql__${typeName}`]: {
        type: typeMap[typeName],
      },
    };
  }, {});

  const fraqlSchema = new GraphQLSchema({
    query: new GraphQLObjectType({ name: 'Query', fields }),
  });

  return mergeSchemas({
    schemas: [originalSchema, fraqlSchema],
  });
};

// Adapted from https://github.com/smooth-code/fraql/blob/65674bc6a7f523ea3b20d8ecd34007a820cf5c67/src/mock.js#L52-L78
const ergonomockFragment = <TData,>(
  query: DocumentNode,
  options?: ErgonomockOptions,
): TData => {
  const fragmentDefinition = query.definitions[0];
  if (fragmentDefinition.kind !== 'FragmentDefinition') {
    throw new Error('ergonomockFragment only supports fragments');
  }
  const typeName = fragmentDefinition.typeCondition.name.value;
  const fieldName = `fraql__${typeName}`;
  const wrappedQuery = gql`
    query {
      ${fieldName} {
        ...${fragmentDefinition.name.value}
      }
    }
    ${query}
  `;
  const res = ergonomock(
    generateSchemaWithFragmentsAsQueries(),
    addTypenameToDocument(wrappedQuery),
    options &&
      ({
        ...options,
        mocks: { [fieldName]: options.mocks },
        seed,
      } as ErgonomockOptions),
  ) as ExecutionResult;

  if (res.errors && res.errors.length) {
    throw res.errors[0];
  }

  if (res?.data?.[fieldName] === undefined) {
    throw new Error(`fraql: type "${typeName}" not found`);
  }
  return res.data[fieldName] as TData;
};

const ergonomockQuery = <TData,>(
  query: DocumentNode,
  options?: ErgonomockOptions,
): TData => {
  const res = ergonomock(schema, addTypenameToDocument(query), {
    ...options,
    seed,
  }) as ExecutionResult;

  if (res.errors && res.errors.length) {
    throw res.errors[0];
  }

  return res.data as TData;
};

const documentContainsNonFragments = (document: DocumentNode): boolean =>
  document.definitions.some(({ kind }) => kind !== 'FragmentDefinition');

export const gqlMock = <TData, TVariables = never>(
  query: DocumentNode,
  options?: ErgonomockOptions & {
    mocks?: DeepPartial<TData>;
    variables?: TVariables;
  },
): TData => {
  const optionsWithResolvers = {
    ...options,
    resolvers: {
      ...options?.resolvers,
      ...resolvers,
    },
  };

  return documentContainsNonFragments(query)
    ? ergonomockQuery(query, optionsWithResolvers)
    : ergonomockFragment(query, optionsWithResolvers);
};
