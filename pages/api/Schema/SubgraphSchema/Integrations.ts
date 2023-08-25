// GOOGLE INTEGRATION
//
// Get Accounts
import GetGoogleAccountsTypeDefs from '../Settings/Preferences/Intergrations/Google/getGoogleAccounts/getGoogleAccounts.graphql';
import { GetGoogleAccountsResolvers } from '../Settings/Preferences/Intergrations/Google/getGoogleAccounts/resolvers';
// account integrations
import GetGoogleAccountIntegrationsTypeDefs from '../Settings/Preferences/Intergrations/Google/getGoogleAccountIntegrations/getGoogleAccountIntegrations.graphql';
import { GetGoogleAccountIntegrationsResolvers } from '../Settings/Preferences/Intergrations/Google/getGoogleAccountIntegrations/resolvers';
// create
import CreateGoogleIntegrationTypeDefs from '../Settings/Preferences/Intergrations/Google/createGoogleIntegration/createGoogleIntegration.graphql';
import { CreateGoogleIntegrationResolvers } from '../Settings/Preferences/Intergrations/Google/createGoogleIntegration/resolvers';
// update
import UpdateGoogleIntegrationTypeDefs from '../Settings/Preferences/Intergrations/Google/updateGoogleIntegration/updateGoogleIntegration.graphql';
import { UpdateGoogleIntegrationResolvers } from '../Settings/Preferences/Intergrations/Google/updateGoogleIntegration/resolvers';
// sync
import SyncGoogleIntegrationTypeDefs from '../Settings/Preferences/Intergrations/Google/syncGoogleIntegration/syncGoogleIntegration.graphql';
import { SyncGoogleIntegrationResolvers } from '../Settings/Preferences/Intergrations/Google/syncGoogleIntegration/resolvers';
// delete
import DeleteGoogleAccountTypeDefs from '../Settings/Preferences/Intergrations/Google/deleteGoogleAccount/deleteGoogleAccount.graphql';
import { DeleteGoogleAccountResolvers } from '../Settings/Preferences/Intergrations/Google/deleteGoogleAccount/resolvers';

// MAILCHIMP INTEGRATION
//
// Get Account
import GetMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/getMailchimpAccount/getMailchimpAccount.graphql';
import { GetMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/getMailchimpAccount/resolvers';
// Update Account
import UpdateMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/updateMailchimpAccount/updateMailchimpAccount.graphql';
import { UpdateMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/updateMailchimpAccount/resolvers';
// Sync Account
import SyncMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/syncMailchimpAccount/syncMailchimpAccount.graphql';
import { SyncMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/syncMailchimpAccount/resolvers';
// Delete Account
import DeleteMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/deleteMailchimpAccount/deleteMailchimpAccount.graphql';
import { DeleteMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/deleteMailchimpAccount/resolvers';

export const integrationSchema = [
  {
    typeDefs: GetGoogleAccountsTypeDefs,
    resolvers: GetGoogleAccountsResolvers,
  },
  {
    typeDefs: GetGoogleAccountIntegrationsTypeDefs,
    resolvers: GetGoogleAccountIntegrationsResolvers,
  },
  {
    typeDefs: UpdateGoogleIntegrationTypeDefs,
    resolvers: UpdateGoogleIntegrationResolvers,
  },
  {
    typeDefs: SyncGoogleIntegrationTypeDefs,
    resolvers: SyncGoogleIntegrationResolvers,
  },
  {
    typeDefs: DeleteGoogleAccountTypeDefs,
    resolvers: DeleteGoogleAccountResolvers,
  },
  {
    typeDefs: CreateGoogleIntegrationTypeDefs,
    resolvers: CreateGoogleIntegrationResolvers,
  },
  {
    typeDefs: GetMailchimpAccountTypeDefs,
    resolvers: GetMailchimpAccountResolvers,
  },
  {
    typeDefs: UpdateMailchimpAccountTypeDefs,
    resolvers: UpdateMailchimpAccountResolvers,
  },
  {
    typeDefs: SyncMailchimpAccountTypeDefs,
    resolvers: SyncMailchimpAccountResolvers,
  },
  {
    typeDefs: DeleteMailchimpAccountTypeDefs,
    resolvers: DeleteMailchimpAccountResolvers,
  },
];
