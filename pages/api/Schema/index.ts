import { buildFederatedSchema } from '@apollo/federation';
import { ContactFiltersResolvers } from './ContactFilters/resolvers';
import ContactFiltersTypeDefs from './ContactFilters/contactFilters.graphql';
import { ExportContactsResolvers } from './ExportContacts/resolvers';
import ExportContactsTypeDefs from './ExportContacts/exportContacts.graphql';
import { TaskAnalyticsResolvers } from './TaskAnalytics/resolvers';
import TaskAnalyticsTypeDefs from './TaskAnalytics/taskAnalytics.graphql';

const schema = buildFederatedSchema([
  { typeDefs: ContactFiltersTypeDefs, resolvers: ContactFiltersResolvers },
  { typeDefs: TaskAnalyticsTypeDefs, resolvers: TaskAnalyticsResolvers },
  { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
]);

export default schema;
