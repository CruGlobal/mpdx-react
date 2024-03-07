// GOOGLE INTEGRATION
//
// Get Accounts
import { SendToChalklineResolvers } from '../Settings/Integrations/Chalkine/sendToChalkline/resolvers';
import SendToChalklineTypeDefs from '../Settings/Integrations/Chalkine/sendToChalkline/sendToChalkline.graphql';
import CreateGoogleIntegrationTypeDefs from '../Settings/Integrations/Google/createGoogleIntegration/createGoogleIntegration.graphql';
import { CreateGoogleIntegrationResolvers } from '../Settings/Integrations/Google/createGoogleIntegration/resolvers';
import DeleteGoogleAccountTypeDefs from '../Settings/Integrations/Google/deleteGoogleAccount/deleteGoogleAccount.graphql';
import { DeleteGoogleAccountResolvers } from '../Settings/Integrations/Google/deleteGoogleAccount/resolvers';
import GoogleAccountIntegrationsTypeDefs from '../Settings/Integrations/Google/googleAccountIntegrations/googleAccountIntegrations.graphql';
import { GoogleAccountIntegrationsResolvers } from '../Settings/Integrations/Google/googleAccountIntegrations/resolvers';
import GoogleAccountsTypeDefs from '../Settings/Integrations/Google/googleAccounts/googleAccounts.graphql';
import { GoogleAccountsResolvers } from '../Settings/Integrations/Google/googleAccounts/resolvers';
// account integrations
// create
// update
import { SyncGoogleIntegrationResolvers } from '../Settings/Integrations/Google/syncGoogleIntegration/resolvers';
import SyncGoogleIntegrationTypeDefs from '../Settings/Integrations/Google/syncGoogleIntegration/syncGoogleIntegration.graphql';
import { UpdateGoogleIntegrationResolvers } from '../Settings/Integrations/Google/updateGoogleIntegration/resolvers';
import UpdateGoogleIntegrationTypeDefs from '../Settings/Integrations/Google/updateGoogleIntegration/updateGoogleIntegration.graphql';
// sync
// delete
// MAILCHIMP INTEGRATION
//
// Get Account
import DeleteMailchimpAccountTypeDefs from '../Settings/Integrations/Mailchimp/deleteMailchimpAccount/deleteMailchimpAccount.graphql';
import { DeleteMailchimpAccountResolvers } from '../Settings/Integrations/Mailchimp/deleteMailchimpAccount/resolvers';
import MailchimpAccountTypeDefs from '../Settings/Integrations/Mailchimp/mailchimpAccount/mailchimpAccount.graphql';
import { MailchimpAccountResolvers } from '../Settings/Integrations/Mailchimp/mailchimpAccount/resolvers';
// Update Account
import { SyncMailchimpAccountResolvers } from '../Settings/Integrations/Mailchimp/syncMailchimpAccount/resolvers';
import SyncMailchimpAccountTypeDefs from '../Settings/Integrations/Mailchimp/syncMailchimpAccount/syncMailchimpAccount.graphql';
import { UpdateMailchimpAccountResolvers } from '../Settings/Integrations/Mailchimp/updateMailchimpAccount/resolvers';
import UpdateMailchimpAccountTypeDefs from '../Settings/Integrations/Mailchimp/updateMailchimpAccount/updateMailchimpAccount.graphql';
// Sync Account
// Delete Account
//
// Prayerletters INTEGRATION
//
// Get Account
import DeletePrayerlettersAccountTypeDefs from '../Settings/Integrations/Prayerletters/deletePrayerlettersAccount/deletePrayerlettersAccount.graphql';
import { DeletePrayerlettersAccountResolvers } from '../Settings/Integrations/Prayerletters/deletePrayerlettersAccount/resolvers';
import PrayerlettersAccountTypeDefs from '../Settings/Integrations/Prayerletters/prayerlettersAccount/prayerlettersAccount.graphql';
import { PrayerlettersAccountResolvers } from '../Settings/Integrations/Prayerletters/prayerlettersAccount/resolvers';
// Sync Account
import { SyncPrayerlettersAccountResolvers } from '../Settings/Integrations/Prayerletters/syncPrayerlettersAccount/resolvers';
import SyncPrayerlettersAccountTypeDefs from '../Settings/Integrations/Prayerletters/syncPrayerlettersAccount/syncPrayerlettersAccount.graphql';
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
