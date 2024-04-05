/**
 * @param {import('graphql/type').GraphQLSchema} schema
 * @returns string
 */
module.exports.plugin = (schema) => {
  const rootQueries = Object.keys(schema.getQueryType().getFields());
  const rootMutations = Object.keys(schema.getMutationType().getFields());
  const rootFields = [...rootQueries, ...rootMutations].filter(
    (field) => !field.startsWith('_'),
  );

  return `export const rootFields = [\n${rootFields
    .map((field) => `  '${field}',\n`)
    .join('')}];\n`;
};
