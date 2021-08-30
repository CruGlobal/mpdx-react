module.exports = {
  client: {
    // Apollo CLI throws errors about duplicate operations if it finds the output of GraphQL Code Generator
    excludes: ['**/*.generated.ts'],
    service: {
      name: 'MPDX',
      localSchemaFile: './graphql/schema.graphql',
    },
  },
};
