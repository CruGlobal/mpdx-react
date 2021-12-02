import { Resolvers } from "pages/api/graphql-rest.page.generated";

const AccountListAnalyticsResolvers: Resolvers = {
    Query: {
        accountListAnalytics: async (_source, {accountListId}, {dataSources}) =>{
            return dataSources.mpdxRestApi.getAccountListAnalytics(accountListId);
        }
    }
}

export { AccountListAnalyticsResolvers };