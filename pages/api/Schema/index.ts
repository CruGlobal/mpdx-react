import { buildFederatedSchema } from '@apollo/federation';
import { CoachingAnswerSetsResolvers } from './CoachingAnswerSets/resolvers';
import CoachingAnswerSetsTypeDefs from './CoachingAnswerSets/coachingAnswerSets.graphql';
import ScalarTypeDefs from './scalars.graphql';
import { ScalarResolvers } from './scalarResolvers';
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
import FinancialAccountsTypeDefs from './reports/financialAccounts/financialAccounts.graphql';
import { FinancialAccountsResolvers } from './reports/financialAccounts/resolvers';
import EntryHistoriesTypeDefs from './reports/entryHistories/entryHistories.graphql';
import { EntryHistoriesResolvers } from './reports/entryHistories/resolvers';
import UpdateCommentTypeDefs from './Tasks/Comments/UpdateComments/updateComments.graphql';
import { UpdateCommentResolvers } from './Tasks/Comments/UpdateComments/resolvers';

const schema = buildFederatedSchema([
  {
    typeDefs: CoachingAnswerSetsTypeDefs,
    resolvers: CoachingAnswerSetsResolvers,
  },
  { typeDefs: ScalarTypeDefs, resolvers: ScalarResolvers },
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
    typeDefs: FinancialAccountsTypeDefs,
    resolvers: FinancialAccountsResolvers,
  },
  {
    typeDefs: EntryHistoriesTypeDefs,
    resolvers: EntryHistoriesResolvers,
  },
  {
    typeDefs: UpdateCommentTypeDefs,
    resolvers: UpdateCommentResolvers,
  },
]);

export default schema;
