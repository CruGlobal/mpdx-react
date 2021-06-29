import { buildFederatedSchema } from '@apollo/federation';
import ScalarTypeDefs from './scalars.graphql';
import { ScalarResolvers } from './scalarResolvers';
import { ExportContactsResolvers } from './ExportContacts/resolvers';
import ExportContactsTypeDefs from './ExportContacts/exportContacts.graphql';
import { TaskAnalyticsResolvers } from './TaskAnalytics/resolvers';
import TaskAnalyticsTypeDefs from './TaskAnalytics/taskAnalytics.graphql';
import FourteenMonthReportTypeDefs from './reports/fourteenMonth/fourteenMonth.graphql';
import { FourteenMonthReportResolvers } from './reports/fourteenMonth/resolvers';

const schema = buildFederatedSchema([
  { typeDefs: ScalarTypeDefs, resolvers: ScalarResolvers },
  { typeDefs: TaskAnalyticsTypeDefs, resolvers: TaskAnalyticsResolvers },
  { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
  {
    typeDefs: FourteenMonthReportTypeDefs,
    resolvers: FourteenMonthReportResolvers,
  },
]);

export default schema;
