import React, { PropsWithChildren, ReactElement } from 'react';
import {
  buildASTSchema,
  DocumentNode,
  execute,
  ExecutionResult,
  FieldNode,
  getNamedType,
  getNullableType,
  GraphQLEnumType,
  GraphQLField,
  GraphQLFieldResolver,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  GraphQLUnionType,
  isAbstractType,
  isObjectType,
  isSchema,
  Kind,
  parse,
  TypeInfo,
  validate,
  visit,
  visitWithTypeInfo,
} from 'graphql';
import { getFieldDef } from 'graphql/execution/execute';
import {
  ApolloErgonoMockMap,
  ErgonoMockedProvider,
  ErgonoMockedProviderProps,
  ErgonomockOptions,
  ErgonoMockShape,
  // ergonomock, // Import back once graphql-ergonomock supports GraphQL 16
} from 'graphql-ergonomock';
import seedrandom from 'seedrandom';
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
    mocks={mocks as unknown as ApolloErgonoMockMap}
    schema={schema}
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
  return res.data[fieldName] as TData;
};

const ergonomockQuery = <TData,>(
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
    ? ergonomockQuery(query, options)
    : ergonomockFragment(query, options);

// TODO: graphql-ergonomock (https://github.com/SurveyMonkey/graphql-ergonomock) currently uses GraphQL 15.
// Remove all the code below once graphql-ergonomock supports GraphQL 16,
// also remove the graphql-ergonomock resolutions and 'seedrandom' from the package.json of this project.
// Below the modified ergonomock() to support breaking chances on GraphQL 16.
// As such, getFieldDef() now requires 'FieldNode' instead of a 'string' for its third argument.
// getFieldDef() changes: https://github.com/graphql/graphql-js/pull/3084/files
/* eslint-disable @typescript-eslint/no-explicit-any */
function ergonomock(
  inputSchema: GraphQLSchema | DocumentNode,
  query: string | DocumentNode,
  options: ErgonomockOptions = {},
) {
  const { mocks, seed, variables = {} } = options;
  let schema: GraphQLSchema = inputSchema as GraphQLSchema;
  if (!isSchema(inputSchema)) {
    try {
      schema = buildASTSchema(inputSchema);
      if (!isSchema(schema)) {
        throw new Error('Ergonomock requires a valid GraphQL schema.');
      }
    } catch (err) {
      throw new Error('Ergonomock requires a valid GraphQL schema.');
    }
  }

  if (!query) {
    throw new Error(
      'Ergonomock requires a GraphQL query, either as a string or DocumentNode.',
    );
  }

  const document = typeof query === 'string' ? parse(query) : query;

  const errors = validate(schema, document);
  if (errors.length) {
    throw errors[0];
  }

  random.seed(seed);

  const resolverOverrides: Map<
    string,
    GraphQLFieldResolver<any, any>
  > = new Map();
  if (options.resolvers) {
    Object.entries(options.resolvers).forEach(([type, resolver]) =>
      resolverOverrides.set(type, resolver),
    );
  }

  const mockResolverFunction = function (
    type: GraphQLType,
    fieldName?: string,
  ): GraphQLFieldResolver<ErgonoMockShape, any> {
    return (root, args, context, info) => {
      const fieldType = getNullableType(type) as GraphQLNullableType;

      if (root && fieldName && typeof root[fieldName] !== 'undefined') {
        const mock = root[fieldName];
        if (typeof mock === 'function') {
          return mock(root, args, context, info);
        }
        return root[fieldName];
      }

      if (fieldType instanceof GraphQLList) {
        return random
          .list()
          .map((_) =>
            mockResolverFunction(fieldType.ofType)(root, args, context, info),
          );
      }

      if (
        fieldType instanceof GraphQLUnionType ||
        fieldType instanceof GraphQLInterfaceType
      ) {
        const possibleTypes = schema.getPossibleTypes(fieldType);
        const implementationType = getRandomElement(possibleTypes);
        return Object.assign(
          { __typename: implementationType },
          mockResolverFunction(implementationType)(root, args, context, info),
        );
      }

      if (resolverOverrides.has(fieldType.name)) {
        return resolverOverrides.get(fieldType.name)?.(
          root,
          args,
          context,
          info,
        );
      }

      if (fieldType instanceof GraphQLEnumType) {
        return getRandomElement(fieldType.getValues()).value;
      }

      if (isObjectType(fieldType)) {
        return { __typename: fieldType.name };
      }

      if (defaultMockMap.has(fieldType.name)) {
        return defaultMockMap.get(fieldType.name)?.(root, args, context, info);
      }
    };
  };

  forEachFieldInQuery(schema, document, (field, typeName, fieldName) => {
    assignResolveType(field.type);
    let mockResolver: GraphQLFieldResolver<any, any>;

    const isOnQueryType = !!(
      schema.getQueryType() && schema.getQueryType()?.name === typeName
    );
    const isOnMutationType = !!(
      schema.getMutationType() && schema.getMutationType()?.name === typeName
    );

    if (isOnQueryType || isOnMutationType) {
      mockResolver = (root, args, context, info) => {
        return mockResolverFunction(field.type, fieldName)(
          mocks || {},
          args,
          context,
          info,
        );
      };
    } else {
      mockResolver = mockResolverFunction(field.type, fieldName);
    }
    field.resolve = mockResolver;
  });

  const resp = execute({
    schema,
    document,
    rootValue: {},
    contextValue: {},
    variableValues: variables,
  });
  return resp;
}

const defaultMockMap: Map<string, GraphQLFieldResolver<any, any>> = new Map();
defaultMockMap.set('Int', () => random.integer());
defaultMockMap.set('Float', () => random.float());
defaultMockMap.set('String', () => random.words());
defaultMockMap.set('Boolean', () => random.boolean());
defaultMockMap.set('ID', () => `${random.integer(10000000, 100000)}`);

let rng = seedrandom();

const random = {
  seed: (seed?: string) => {
    rng = seedrandom(seed);
  },
  integer: (max = 100, min = 1) => Math.floor(random.float(max, min)),
  float: (max = 100, min = 1) => rng() * (max - min) + min,
  list: (maxLength = 4, minLength = 1) => [
    ...Array(random.integer(maxLength + 1, minLength)),
  ],
  words: (numWordsMax = 3, numWordsMin = 1) => {
    return random
      .list(numWordsMax, numWordsMin)
      .map((_) => {
        return words[random.integer(words.length, 0)];
      })
      .join(' ');
  },
  boolean: () => rng() > 0.5,
};

function getRandomElement(ary: ReadonlyArray<any>) {
  const sample = Math.floor(Math.random() * ary.length);
  return ary[sample];
}

type IteratorFn = (
  fieldDef: GraphQLField<any, any>,
  parentType: string,
  fieldName: string,
) => void;

function forEachFieldInQuery(
  schema: GraphQLSchema,
  document: DocumentNode,
  fn: IteratorFn,
) {
  const typeInfo = new TypeInfo(schema);
  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      [Kind.FIELD](node: FieldNode): FieldNode | null | undefined {
        const fieldName = node.name.value;
        if (fieldName === '__typename') {
          return;
        }
        const parentType = typeInfo.getParentType();
        if (isAbstractType(parentType)) {
          const possibleTypes = schema.getPossibleTypes(parentType);
          possibleTypes.forEach((t) => {
            const fieldDef = getFieldDef(schema, t, node);
            if (fieldDef) {
              fn(fieldDef, t.name, fieldName);
            }
          });
        }
        if (isObjectType(parentType)) {
          const parentFields = parentType.getFields();
          const fieldDef = parentFields[node.name.value];
          fn(fieldDef, parentType.name, fieldName);
        }
      },
    }),
  );
}

function assignResolveType(type: GraphQLType) {
  const fieldType = getNullableType(type) as GraphQLNullableType;
  const namedFieldType = getNamedType(fieldType);
  if (
    namedFieldType instanceof GraphQLUnionType ||
    namedFieldType instanceof GraphQLInterfaceType
  ) {
    namedFieldType.resolveType = (data: any) => {
      return data.__typename;
    };
  }
}

const words = [
  'Aeroplane',
  'Air',
  'Aircraft Carrier',
  'Airforce',
  'Airport',
  'Album',
  'Alphabet',
  'Apple',
  'Arm',
  'Backpack',
  'Balloon',
  'Banana',
  'Bank',
  'Barbecue',
  'Bathroom',
  'Bathtub',
  'Bed',
  'Bee',
  'Bird',
  'Book',
  'Boss',
  'Bottle',
  'Bowl',
  'Box',
  'Brain',
  'Bridge',
  'Butterfly',
  'Button',
  'Cappuccino',
  'Car',
  'Car-race',
  'Carpet',
  'Carrot',
  'Cave',
  'Chair',
  'Chess Board',
  'Chief',
  'Chocolates',
  'Circle',
  'Circus',
  'Clock',
  'Coffee',
  'Coffee-shop',
  'Comet',
  'Compact Disc',
  'Compass',
  'Computer',
  'Crystal',
  'Cup',
  'Cycle',
  'Data Base',
  'Desk',
  'Diamond',
  'Dress',
  'Drill',
  'Drink',
  'Drum',
  'Ears',
  'Earth',
  'Egg',
  'Electricity',
  'Elephant',
  'Eraser',
  'Eyes',
  'Family',
  'Fan',
  'Feather',
  'Festival',
  'Film',
  'Fire',
  'Floodlight',
  'Flower',
  'Foot',
  'Fork',
  'Freeway',
  'Fruit',
  'Fungus',
  'Game',
  'Garden',
  'Gas',
  'Gate',
  'Gemstone',
  'Gloves',
  'God',
  'Grapes',
  'Guitar',
  'Hammer',
  'Hat',
  'Hieroglyph',
  'Highway',
  'Horoscope',
  'Horse',
  'Hose',
  'Ice',
  'Ice-cream',
  'Insect',
  'Jet fighter',
  'Kaleidoscope',
  'Kitchen',
  'Leather jacket',
  'Leg',
  'Library',
  'Liquid',
  'Magnet',
  'Map',
  'Maze',
  'Meat',
  'Meteor',
  'Microscope',
  'Milk',
  'Milkshake',
  'Mist',
  'Mosquito',
  'Nail',
  'Navy',
  'Necklace',
  'Needle',
  'Onion',
  'PaintBrush',
  'Pants',
  'Parachute',
  'Passport',
  'Pebble',
  'Pendulum',
  'Pepper',
  'Perfume',
  'Pillow',
  'Plane',
  'Planet',
  'Pocket',
  'Post-office',
  'Potato',
  'Printer',
  'Pyramid',
  'Radar',
  'Rainbow',
  'Record',
  'Restaurant',
  'Ring',
  'Rock',
  'Rocket',
  'Roof',
  'Room',
  'Rope',
  'Salt',
  'Sandpaper',
  'Sandwich',
  'Satellite',
  'School',
  'Ship',
  'Shoes',
  'Shop',
  'Shower',
  'Signature',
  'Skeleton',
  'Snail',
  'Software',
  'Solid',
  'Space Shuttle',
  'Spectrum',
  'Sphere',
  'Spice',
  'Spiral',
  'Spoon',
  'Sports-car',
  'Spot Light',
  'Square',
  'Staircase',
  'Star',
  'Stomach',
  'Sun',
  'Sunglasses',
  'Surveyor',
  'Swimming Pool',
  'Sword',
  'Table',
  'Tapestry',
  'Teeth',
  'Telescope',
  'Television',
  'Tennis racquet',
  'Thermometer',
  'Tiger',
  'Torch',
  'Torpedo',
  'Train',
  'Treadmill',
  'Triangle',
  'Tunnel',
  'Typewriter',
  'Umbrella',
  'Vacuum',
  'Videotape',
  'Water',
  'Web',
  'Wheelchair',
  'Window',
  'X-ray',
];
