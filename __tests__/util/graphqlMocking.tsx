import React, { PropsWithChildren, ReactElement } from 'react';
import {
  buildSchema,
  DocumentNode,
  ExecutionResult,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import {
  ApolloErgonoMockMap,
  ergonomock,
  ErgonoMockedProvider,
  ErgonoMockedProviderProps,
  ErgonomockOptions,
} from 'graphql-ergonomock';
import { mergeSchemas } from '@graphql-tools/schema';
import { gql } from 'graphql-tag';
import { DeepPartial } from 'ts-essentials';
import schema from '../../graphql/schema.graphql';

export const GqlMockedProvider = <TData,>({
  children,
  mocks,
  ...props
}: PropsWithChildren<
  Omit<ErgonoMockedProviderProps, 'schema'> & {
    mocks?: DeepPartial<TData>;
  }
>): ReactElement => (
  <ErgonoMockedProvider
    {...props}
    mocks={(mocks as unknown) as ApolloErgonoMockMap}
    schema={schema}
  >
    {children}
  </ErgonoMockedProvider>
);

// Adapted from https://github.com/smooth-code/fraql/blob/65674bc6a7f523ea3b20d8ecd34007a820cf5c67/src/mock.js#L16-L43
const generateSchemaWithFragmentsAsQueries = (
  schemaDocument: DocumentNode,
): GraphQLSchema => {
  if (!schemaDocument.loc?.source.body) {
    throw new Error('generateSchemaWithFragmentsAsQueries: Schema invalid');
  }
  const originalSchema = buildSchema(schemaDocument.loc.source.body);
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
  schema: DocumentNode,
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
    generateSchemaWithFragmentsAsQueries(schema),
    wrappedQuery,
    options &&
      ({
        ...options,
        mocks: { [fieldName]: options.mocks },
        seed: 'seed',
      } as ErgonomockOptions),
  ) as ExecutionResult;

  if (res.errors && res.errors.length) {
    throw res.errors[0];
  }

  if (res?.data?.[fieldName] === undefined) {
    throw new Error(`fraql: type "${typeName}" not found`);
  }
  return res.data[fieldName];
};

const ergonomockQuery = <TData,>(
  schema: DocumentNode,
  query: DocumentNode,
  options?: ErgonomockOptions,
): TData => {
  const res = ergonomock(schema, query, {
    ...options,
    seed: 'seed',
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
): TData =>
  documentContainsNonFragments(query)
    ? ergonomockQuery(schema, query, options)
    : ergonomockFragment(schema, query, options);
