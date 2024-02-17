import { buildSubgraphSchema } from '@apollo/subgraph';
import AccountListAnalyticsTypeDefs from './AccountListAnalytics/accountListAnalytics.graphql';
import { AccountListAnalyticsResolvers } from './AccountListAnalytics/resolvers';
import AccountListCoachesTypeDefs from './AccountListCoaches/accountListCoaches.graphql';
import { AccountListCoachesResolvers } from './AccountListCoaches/resolvers';
import AccountListDonorAccountsTypeDefs from './AccountListDonorAccounts/accountListDonorAccounts.graphql';
import { AccountListDonorAccountsResolvers } from './AccountListDonorAccounts/resolvers';
import CoachingAnswerSetsTypeDefs from './CoachingAnswerSets/coachingAnswerSets.graphql';
import { CoachingAnswerSetsResolvers } from './CoachingAnswerSets/resolvers';
import ContactPrimaryAddressTypeDefs from './ContactPrimaryAddress/contactPrimaryAddress.graphql';
import { ContactPrimaryAddressResolvers } from './ContactPrimaryAddress/resolvers';
import DestroyDonorAccountTypeDefs from './Contacts/DonorAccounts/Destroy/destroyDonorAccount.graphql';
import { DestroyDonorAccountResolvers } from './Contacts/DonorAccounts/Destroy/resolvers';
import ExportContactsTypeDefs from './ExportContacts/exportContacts.graphql';
import { ExportContactsResolvers } from './ExportContacts/resolvers';
import MergeContactsTypeDefs from './MergeContacts/mergeContacts.graphql';
import { MergeContactsResolvers } from './MergeContacts/resolvers';
import { integrationSchema } from './SubgraphSchema/Integrations';
import { organizationSchema } from './SubgraphSchema/Organizations';
import { preferencesSchema } from './SubgraphSchema/Preferences';
import DeleteTagsTypeDefs from './Tags/Delete/deleteTags.graphql';
import { DeleteTagsResolvers } from './Tags/Delete/resolvers';
import { TaskAnalyticsResolvers } from './TaskAnalytics/resolvers';
import TaskAnalyticsTypeDefs from './TaskAnalytics/taskAnalytics.graphql';
import DeleteCommentTypeDefs from './Tasks/Comments/DeleteComments/deleteComment.graphql';
import { DeleteCommentResolvers } from './Tasks/Comments/DeleteComments/resolvers';
import { UpdateCommentResolvers } from './Tasks/Comments/UpdateComments/resolvers';
import UpdateCommentTypeDefs from './Tasks/Comments/UpdateComments/updateComments.graphql';
import DesginationDisplayNamesTypeDefs from './donations/getDesignationDisplayNames.graphql';
import { DesginationDisplayNamesResolvers } from './donations/resolvers';
import AppointmentResultsTypeDefs from './reports/appointmentResults/appointmentResults.graphql';
import { AppointmentResultsResolvers } from './reports/appointmentResults/resolvers';
import DesignationAccountsTypeDefs from './reports/designationAccounts/designationAccounts.graphql';
import { DesignationAccountsResolvers } from './reports/designationAccounts/resolvers';
import EntryHistoriesTypeDefs from './reports/entryHistories/entryHistories.graphql';
import { EntryHistoriesResolvers } from './reports/entryHistories/resolvers';
import ExpectedMonthlyTotalReportTypeDefs from './reports/expectedMonthlyTotal/expectedMonthlyTotal.graphql';
import { ExpectedMonthlyTotalReportResolvers } from './reports/expectedMonthlyTotal/resolvers';
import FinancialAccountsTypeDefs from './reports/financialAccounts/financialAccounts.graphql';
import { FinancialAccountsResolvers } from './reports/financialAccounts/resolvers';
import FourteenMonthReportTypeDefs from './reports/fourteenMonth/fourteenMonth.graphql';
import { FourteenMonthReportResolvers } from './reports/fourteenMonth/resolvers';
import PartnerGivingAnalysisTypeDefs from './reports/partnerGivingAnalysis/partnerGivingAnalysis.graphql';
import { PartnerGivingAnalysisReportResolvers } from './reports/partnerGivingAnalysis/resolvers';
import ReportsPledgeHistoriesTyeDefs from './reports/pledgeHistories/pledgeHistories.graphql';
import { ReportsPledgeHistoriesResolvers } from './reports/pledgeHistories/resolvers';
import { ScalarResolvers } from './scalarResolvers';
import ScalarTypeDefs from './scalars.graphql';

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
    typeDefs: AppointmentResultsTypeDefs,
    resolvers: AppointmentResultsResolvers,
  },
  {
    typeDefs: ContactPrimaryAddressTypeDefs,
    resolvers: ContactPrimaryAddressResolvers,
  },
  { typeDefs: ExportContactsTypeDefs, resolvers: ExportContactsResolvers },
  { typeDefs: MergeContactsTypeDefs, resolvers: MergeContactsResolvers },
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
    typeDefs: DestroyDonorAccountTypeDefs,
    resolvers: DestroyDonorAccountResolvers,
  },
  {
    typeDefs: DeleteTagsTypeDefs,
    resolvers: DeleteTagsResolvers,
  },
  ...integrationSchema,
  ...organizationSchema,
  ...preferencesSchema,
]);

export default schema;
