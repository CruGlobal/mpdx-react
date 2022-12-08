import { buildSubgraphSchema } from '@apollo/subgraph';
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
import { PartnerGivingAnalysisReportResolvers } from './reports/partnerGivingAnalysis/resolvers';
import PartnerGivingAnalysisTypeDefs from './reports/partnerGivingAnalysis/partnerGivingAnalysis.graphql';
import ExpectedMonthlyTotalReportTypeDefs from './reports/expectedMonthlyTotal/expectedMonthlyTotal.graphql';
import { ExpectedMonthlyTotalReportResolvers } from './reports/expectedMonthlyTotal/resolvers';
import DesignationAccountsTypeDefs from './reports/designationAccounts/designationAccounts.graphql';
import { DesignationAccountsResolvers } from './reports/designationAccounts/resolvers';
import FinancialAccountsTypeDefs from './reports/financialAccounts/financialAccounts.graphql';
import { FinancialAccountsResolvers } from './reports/financialAccounts/resolvers';
import EntryHistoriesTypeDefs from './reports/entryHistories/entryHistories.graphql';
import { EntryHistoriesResolvers } from './reports/entryHistories/resolvers';
import { AccountListAnalyticsResolvers } from './AccountListAnalytics/resolvers';
import AccountListAnalyticsTypeDefs from './AccountListAnalytics/accountListAnalytics.graphql';
import { AppointmentResultsResolvers } from './reports/appointmentResults/resolvers';
import AppointmentResultsTypeDefs from './reports/appointmentResults/appointmentResults.graphql';
import ContactPrimaryAddressTypeDefs from './ContactPrimaryAddress/contactPrimaryAddress.graphql';
import { ContactPrimaryAddressResolvers } from './ContactPrimaryAddress/resolvers';
import DeleteCommentTypeDefs from './Tasks/Comments/DeleteComments/deleteComment.graphql';
import { DeleteCommentResolvers } from './Tasks/Comments/DeleteComments/resolvers';
import UpdateCommentTypeDefs from './Tasks/Comments/UpdateComments/updateComments.graphql';
import { UpdateCommentResolvers } from './Tasks/Comments/UpdateComments/resolvers';
import AccountListDonorAccountsTypeDefs from './AccountListDonorAccounts/accountListDonorAccounts.graphql';
import { AccountListDonorAccountsResolvers } from './AccountListDonorAccounts/resolvers';
import AccountListCoachUserTypeDefs from './AccountListCoachUser/accountListCoachUser.graphql';
import { AccountListCoachUserResolvers } from './AccountListCoachUser/resolvers';
import AccountListCoachesTypeDefs from './AccountListCoaches/accountListCoaches.graphql';
import { AccountListCoachesResolvers } from './AccountListCoaches/resolvers';
import ReportsPledgeHistoriesTyeDefs from './reports/pledgeHistories/pledgeHistories.graphql';
import { ReportsPledgeHistoriesResolvers } from './reports/pledgeHistories/resolvers';
import DesginationDisplayNamesTypeDefs from './donations/getDesignationDisplayNames.graphql';
import { DesginationDisplayNamesResolvers } from './donations/resolvers';
import TaskLocationTypeDefs from './Tasks/TaskLocation/taskLocation.graphql';
import { TaskLocationResolvers } from './Tasks/TaskLocation/resolvers';
import UpdateTaskLocationTypeDefs from './Tasks/TaskLocation/Update/updateTaskLocation.graphql';
import { UpdateTaskLocationResolvers } from './Tasks/TaskLocation/Update/resolvers';
import DeleteTagsTypeDefs from './Tags/Delete/deleteTags.graphql';
import { DeleteTagsResolvers } from './Tags/Delete/resolvers';

const schema = buildSubgraphSchema([
  {
    typeDefs: CoachingAnswerSetsTypeDefs,
    resolvers: CoachingAnswerSetsResolvers,
  },
  { typeDefs: ScalarTypeDefs, resolvers: ScalarResolvers },
  { typeDefs: TaskAnalyticsTypeDefs, resolvers: TaskAnalyticsResolvers },
  {
    typeDefs: AccountListCoachesTypeDefs,
    resolvers: AccountListCoachesResolvers,
  },
  {
    typeDefs: AccountListAnalyticsTypeDefs,
    resolvers: AccountListAnalyticsResolvers,
  },
  {
    typeDefs: AccountListDonorAccountsTypeDefs,
    resolvers: AccountListDonorAccountsResolvers,
  },
  {
    typeDefs: AccountListCoachUserTypeDefs,
    resolvers: AccountListCoachUserResolvers,
  },
  {
    typeDefs: AppointmentResultsTypeDefs,
    resolvers: AppointmentResultsResolvers,
  },
  {
    typeDefs: ContactPrimaryAddressTypeDefs,
    resolvers: ContactPrimaryAddressResolvers,
  },
  { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
  {
    typeDefs: FourteenMonthReportTypeDefs,
    resolvers: FourteenMonthReportResolvers,
  },
  {
    typeDefs: PartnerGivingAnalysisTypeDefs,
    resolvers: PartnerGivingAnalysisReportResolvers,
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
    typeDefs: ReportsPledgeHistoriesTyeDefs,
    resolvers: ReportsPledgeHistoriesResolvers,
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
    typeDefs: DeleteCommentTypeDefs,
    resolvers: DeleteCommentResolvers,
  },
  {
    typeDefs: UpdateCommentTypeDefs,
    resolvers: UpdateCommentResolvers,
  },
  {
    typeDefs: DesginationDisplayNamesTypeDefs,
    resolvers: DesginationDisplayNamesResolvers,
  },
  {
    typeDefs: TaskLocationTypeDefs,
    resolvers: TaskLocationResolvers,
  },
  {
    typeDefs: UpdateTaskLocationTypeDefs,
    resolvers: UpdateTaskLocationResolvers,
  },
  {
    typeDefs: DeleteTagsTypeDefs,
    resolvers: DeleteTagsResolvers,
  },
]);

export default schema;
