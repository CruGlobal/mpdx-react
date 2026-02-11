import dotenv from 'dotenv';
import type { CodegenConfig } from '@graphql-codegen/cli';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const apiUrl = process.env.API_URL ?? 'https://api.stage.mpdx.org/graphql';
const schema = [apiUrl, './pages/api/Schema/**/*.graphql'];

export default {
  generates: {
    './src/graphql/types.generated.ts': {
      schema,
      plugins: ['typescript'],
      config: {
        scalars: {
          ISO8601Date: 'string',
          ISO8601DateTime: 'string',
        },
      },
    },
    './': {
      schema,
      documents: '**/*.graphql',
      preset: 'near-operation-file',
      presetConfig: {
        baseTypesPath: 'src/graphql/types.generated.ts',
      },
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      config: {
        preResolveTypes: false,
      },
    },
    './src/graphql/schema.graphql': {
      schema,
      plugins: ['schema-ast'],
    },
    './src/graphql/possibleTypes.generated.ts': {
      schema,
      plugins: ['fragment-matcher'],
    },
    './pages/api/graphql-rest.page.generated.ts': {
      schema,
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: './graphql-rest.page#Context',
        scalars: {
          ISO8601Date: 'string',
          ISO8601DateTime: 'string',
        },
      },
    },
    './src/graphql/rootFields.generated.ts': {
      // Don't include REST API schema because we only want the Rails schema
      schema: apiUrl,
      plugins: ['./extractRootFields.js'],
    },
  },
  hooks: {
    afterAllFileWrite: [
      'prettier --write --ignore-path=""',
      'node deleteStaleFiles.mjs',
    ],
  },
} satisfies CodegenConfig;
