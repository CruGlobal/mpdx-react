// GOOGLE INTEGRATION
//
// Get Accounts
import GoogleAccountsTypeDefs from '../Settings/Preferences/Intergrations/Google/googleAccounts/googleAccounts.graphql';
import { GoogleAccountsResolvers } from '../Settings/Preferences/Intergrations/Google/googleAccounts/resolvers';
// account integrations
import GoogleAccountIntegrationsTypeDefs from '../Settings/Preferences/Intergrations/Google/googleAccountIntegrations/googleAccountIntegrations.graphql';
import { GoogleAccountIntegrationsResolvers } from '../Settings/Preferences/Intergrations/Google/googleAccountIntegrations/resolvers';
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
import MailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/mailchimpAccount/mailchimpAccount.graphql';
import { MailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/mailchimpAccount/resolvers';
// Update Account
import UpdateMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/updateMailchimpAccount/updateMailchimpAccount.graphql';
import { UpdateMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/updateMailchimpAccount/resolvers';
// Sync Account
import SyncMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/syncMailchimpAccount/syncMailchimpAccount.graphql';
import { SyncMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/syncMailchimpAccount/resolvers';
// Delete Account
import DeleteMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/deleteMailchimpAccount/deleteMailchimpAccount.graphql';
import { DeleteMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/deleteMailchimpAccount/resolvers';

// Prayerletters INTEGRATION
//
// Get Account
import GetPrayerlettersAccountTypeDefs from '../Settings/Preferences/Intergrations/Prayerletters/getPrayerlettersAccount/getPrayerlettersAccount.graphql';
import { GetPrayerlettersAccountResolvers } from '../Settings/Preferences/Intergrations/Prayerletters/getPrayerlettersAccount/resolvers';
// Sync Account
import SyncPrayerlettersAccountTypeDefs from '../Settings/Preferences/Intergrations/Prayerletters/syncPrayerlettersAccount/syncPrayerlettersAccount.graphql';
import { SyncPrayerlettersAccountResolvers } from '../Settings/Preferences/Intergrations/Prayerletters/syncPrayerlettersAccount/resolvers';
// Delete Account
import DeletePrayerlettersAccountTypeDefs from '../Settings/Preferences/Intergrations/Prayerletters/deletePrayerlettersAccount/deletePrayerlettersAccount.graphql';
import { DeletePrayerlettersAccountResolvers } from '../Settings/Preferences/Intergrations/Prayerletters/deletePrayerlettersAccount/resolvers';

// Chalkkine INTEGRATION
//
// Get Account
import SendToChalklineTypeDefs from '../Settings/Preferences/Intergrations/Chalkine/sendToChalkline/sendToChalkline.graphql';
import { SendToChalklineResolvers } from '../Settings/Preferences/Intergrations/Chalkine/sendToChalkline/resolvers';

export const integrationSchema = [
  {
    typeDefs: GoogleAccountsTypeDefs,
    resolvers: GoogleAccountsResolvers,
  },
  {
    typeDefs: GoogleAccountIntegrationsTypeDefs,
    resolvers: GoogleAccountIntegrationsResolvers,
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
    typeDefs: MailchimpAccountTypeDefs,
    resolvers: MailchimpAccountResolvers,
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
  {
    typeDefs: GetPrayerlettersAccountTypeDefs,
    resolvers: GetPrayerlettersAccountResolvers,
  },
  {
    typeDefs: SyncPrayerlettersAccountTypeDefs,
    resolvers: SyncPrayerlettersAccountResolvers,
  },
  {
    typeDefs: DeletePrayerlettersAccountTypeDefs,
    resolvers: DeletePrayerlettersAccountResolvers,
  },
  {
    typeDefs: SendToChalklineTypeDefs,
    resolvers: SendToChalklineResolvers,
  },
];
