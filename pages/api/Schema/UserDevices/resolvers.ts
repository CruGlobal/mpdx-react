import { Resolvers } from '../../graphql-rest.page.generated';

export const UserDevicesResolvers: Resolvers = {
  Mutation: {
    registerUserDevice: (_source, { input }, { dataSources }) =>
      dataSources.mpdxRestApi.registerUserDevice(input),
    destroyUserDevice: (_source, { input: { id } }, { dataSources }) =>
      dataSources.mpdxRestApi.destroyUserDevice(id),
  },
};
