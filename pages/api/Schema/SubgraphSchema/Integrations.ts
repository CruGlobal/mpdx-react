// GOOGLE INTEGRATION
//
// Get Accounts
import { SendToChalklineResolvers } from '../Settings/Preferences/Intergrations/Chalkine/sendToChalkline/resolvers';
import SendToChalklineTypeDefs from '../Settings/Preferences/Intergrations/Chalkine/sendToChalkline/sendToChalkline.graphql';
import CreateGoogleIntegrationTypeDefs from '../Settings/Preferences/Intergrations/Google/createGoogleIntegration/createGoogleIntegration.graphql';
import { CreateGoogleIntegrationResolvers } from '../Settings/Preferences/Intergrations/Google/createGoogleIntegration/resolvers';
import DeleteGoogleAccountTypeDefs from '../Settings/Preferences/Intergrations/Google/deleteGoogleAccount/deleteGoogleAccount.graphql';
import { DeleteGoogleAccountResolvers } from '../Settings/Preferences/Intergrations/Google/deleteGoogleAccount/resolvers';
import GoogleAccountIntegrationsTypeDefs from '../Settings/Preferences/Intergrations/Google/googleAccountIntegrations/googleAccountIntegrations.graphql';
import { GoogleAccountIntegrationsResolvers } from '../Settings/Preferences/Intergrations/Google/googleAccountIntegrations/resolvers';
import GoogleAccountsTypeDefs from '../Settings/Preferences/Intergrations/Google/googleAccounts/googleAccounts.graphql';
import { GoogleAccountsResolvers } from '../Settings/Preferences/Intergrations/Google/googleAccounts/resolvers';
// account integrations
// create
// update
import { SyncGoogleIntegrationResolvers } from '../Settings/Preferences/Intergrations/Google/syncGoogleIntegration/resolvers';
import SyncGoogleIntegrationTypeDefs from '../Settings/Preferences/Intergrations/Google/syncGoogleIntegration/syncGoogleIntegration.graphql';
import { UpdateGoogleIntegrationResolvers } from '../Settings/Preferences/Intergrations/Google/updateGoogleIntegration/resolvers';
import UpdateGoogleIntegrationTypeDefs from '../Settings/Preferences/Intergrations/Google/updateGoogleIntegration/updateGoogleIntegration.graphql';
// sync
// delete
// MAILCHIMP INTEGRATION
//
// Get Account
import DeleteMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/deleteMailchimpAccount/deleteMailchimpAccount.graphql';
import { DeleteMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/deleteMailchimpAccount/resolvers';
import MailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/mailchimpAccount/mailchimpAccount.graphql';
import { MailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/mailchimpAccount/resolvers';
// Update Account
import { SyncMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/syncMailchimpAccount/resolvers';
import SyncMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/syncMailchimpAccount/syncMailchimpAccount.graphql';
import { UpdateMailchimpAccountResolvers } from '../Settings/Preferences/Intergrations/Mailchimp/updateMailchimpAccount/resolvers';
import UpdateMailchimpAccountTypeDefs from '../Settings/Preferences/Intergrations/Mailchimp/updateMailchimpAccount/updateMailchimpAccount.graphql';
// Sync Account
// Delete Account
//
// Prayerletters INTEGRATION
//
// Get Account
import DeletePrayerlettersAccountTypeDefs from '../Settings/Preferences/Intergrations/Prayerletters/deletePrayerlettersAccount/deletePrayerlettersAccount.graphql';
import { DeletePrayerlettersAccountResolvers } from '../Settings/Preferences/Intergrations/Prayerletters/deletePrayerlettersAccount/resolvers';
import PrayerlettersAccountTypeDefs from '../Settings/Preferences/Intergrations/Prayerletters/prayerlettersAccount/prayerlettersAccount.graphql';
import { PrayerlettersAccountResolvers } from '../Settings/Preferences/Intergrations/Prayerletters/prayerlettersAccount/resolvers';
// Sync Account
import { SyncPrayerlettersAccountResolvers } from '../Settings/Preferences/Intergrations/Prayerletters/syncPrayerlettersAccount/resolvers';
import SyncPrayerlettersAccountTypeDefs from '../Settings/Preferences/Intergrations/Prayerletters/syncPrayerlettersAccount/syncPrayerlettersAccount.graphql';
// Delete Account
//
// Chalkkine INTEGRATION
//
// Get Account

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
    typeDefs: PrayerlettersAccountTypeDefs,
    resolvers: PrayerlettersAccountResolvers,
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
