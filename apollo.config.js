module.exports = {
  client: {
    service: {
      name: 'MPDX',
      url: 'https://api.stage.mpdx.org/graphql',
    },
    // Added generated files to avoid duplicate operation name errors https://www.apollographql.com/docs/devtools/apollo-config/#clientexcludes
    excludes: ['**/node_modules', '**/__tests__', '**/*.generated.ts'],
  },
};
