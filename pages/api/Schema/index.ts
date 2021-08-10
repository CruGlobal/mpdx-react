import { buildFederatedSchema } from '@apollo/federation';
import ScalarTypeDefs from './scalars.graphql';
import { ScalarResolvers } from './scalarResolvers';
import { ContactFiltersResolvers } from './ContactFilters/resolvers';
import ContactFiltersTypeDefs from './ContactFilters/contactFilters.graphql';
import { ExportContactsResolvers } from './ExportContacts/resolvers';
import ExportContactsTypeDefs from './ExportContacts/exportContacts.graphql';
import { TaskAnalyticsResolvers } from './TaskAnalytics/resolvers';
import TaskAnalyticsTypeDefs from './TaskAnalytics/taskAnalytics.graphql';
import FourteenMonthReportTypeDefs from './reports/fourteenMonth/fourteenMonth.graphql';
import { FourteenMonthReportResolvers } from './reports/fourteenMonth/resolvers';
import ExpectedMonthlyTotalReportTypeDefs from './reports/expectedMonthlyTotal/expectedMonthlyTotal.graphql';
import { ExpectedMonthlyTotalReportResolvers } from './reports/expectedMonthlyTotal/resolvers';
import DesignationAccountsTypeDefs from './reports/designationAccounts/designationAccounts.graphql';
import { DesignationAccountsResolvers } from './reports/designationAccounts/resolvers';
import AppealsTypeDefs from './Appeals/appeal.graphql';
import { AppealsResolvers } from './Appeals/resolver';

const schema = buildFederatedSchema([
  { typeDefs: ScalarTypeDefs, resolvers: ScalarResolvers },
  { typeDefs: ContactFiltersTypeDefs, resolvers: ContactFiltersResolvers },
  { typeDefs: TaskAnalyticsTypeDefs, resolvers: TaskAnalyticsResolvers },
  { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
  {
    typeDefs: FourteenMonthReportTypeDefs,
    resolvers: FourteenMonthReportResolvers,
  },
  {
    typeDefs: ExpectedMonthlyTotalReportTypeDefs,
    resolvers: ExpectedMonthlyTotalReportResolvers,
  },
  {
    typeDefs: DesignationAccountsTypeDefs,
    resolvers: DesignationAccountsResolvers,
  },
  {
    typeDefs: AppealsTypeDefs,
    resolvers: AppealsResolvers,
  },
]);

export default schema;
