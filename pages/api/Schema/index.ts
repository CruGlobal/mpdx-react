import { buildFederatedSchema } from '@apollo/federation';
import ContactFiltersResolvers from './ContactFilters/resolvers';
import ContactFiltersTypeDefs from './ContactFilters/typeDefs';
import ExportContactsResolvers from './ExportContacts/resolvers';
import ExportContactsTypeDefs from './ExportContacts/typeDefs';
import TaskAnalyticsResolvers from './TaskAnalytics/resolvers';
import TaskAnalyticsTypeDefs from './TaskAnalytics/typeDefs';

const schema = buildFederatedSchema([
  { typeDefs: ContactFiltersTypeDefs, resolvers: ContactFiltersResolvers },
  { typeDefs: TaskAnalyticsTypeDefs, resolvers: TaskAnalyticsResolvers },
  { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
]);

export default schema;
