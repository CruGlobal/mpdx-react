// Get Organizations
import GetOrganizationsTypeDefs from '../Settings/Preferences/Organizations/GetOrganizations/GetOrganizations.graphql';
import { GetOrganizationsResolvers } from '../Settings/Preferences/Organizations/GetOrganizations/resolvers';
// Get Organization admin list
import GetOrganizationAdminsTypeDefs from '../Settings/Preferences/Organizations/GetOrganizationAdmins/GetOrganizations.graphql';
import { GetOrganizationAdminsResolvers } from '../Settings/Preferences/Organizations/GetOrganizationAdmins/resolvers';
// Get Organization invite list
import GetOrganizationInvitesTypeDefs from '../Settings/Preferences/Organizations/GetOrganizationInvites/GetOrganizationInvites.graphql';
import { GetOrganizationInvitesResolvers } from '../Settings/Preferences/Organizations/GetOrganizationInvites/resolvers';

// Delete Organization admin
import DeleteOrganizationAdminTypeDefs from '../Settings/Preferences/Organizations/DeleteOrganizationAdmin/DeleteOrganizationAdmin.graphql';
import { DeleteOrganizationAdminResolvers } from '../Settings/Preferences/Organizations/DeleteOrganizationAdmin/resolvers';

// Delete Organization invite
import DeleteOrganizationInviteTypeDefs from '../Settings/Preferences/Organizations/DeleteOrganizationInvite/DeleteOrganizationInvite.graphql';
import { DeleteOrganizationInviteResolvers } from '../Settings/Preferences/Organizations/DeleteOrganizationInvite/resolvers';

// Create Organization invite
import CreateOrganizationInviteTypeDefs from '../Settings/Preferences/Organizations/CreateOrganizationInvite/CreateOrganizationInvite.graphql';
import { CreateOrganizationInviteResolvers } from '../Settings/Preferences/Organizations/CreateOrganizationInvite/resolvers';
// Search Organization contacts
import SearchOrganizationsContactsTypeDefs from '../Settings/Preferences/Organizations/SearchOrganizationsContacts/SearchOrganizationsContacts.graphql';
import { SearchOrganizationsContactsResolvers } from '../Settings/Preferences/Organizations/SearchOrganizationsContacts/resolvers';
// Delete Organization contact
import DeleteOrganizationContactTypeDefs from '../Settings/Preferences/Organizations/DeleteOrganizationContact/DeleteOrganizationContact.graphql';
import { DeleteOrganizationContactResolvers } from '../Settings/Preferences/Organizations/DeleteOrganizationContact/resolvers';
// Search Organization AccountLists
import SearchOrganizationsAccountListsTypeDefs from '../Settings/Preferences/Organizations/SearchOrganizationsAccountLists/SearchOrganizationsAccountLists.graphql';
import { SearchOrganizationsAccountListsResolvers } from '../Settings/Preferences/Organizations/SearchOrganizationsAccountLists/resolvers';

// Admin Delete Organization user
import AdminDeleteOrganizationUserTypeDefs from '../Settings/Preferences/Organizations/AdminDeleteOrganizationUser/AdminDeleteOrganizationUser.graphql';
import { AdminDeleteOrganizationUserResolvers } from '../Settings/Preferences/Organizations/AdminDeleteOrganizationUser/resolvers';
// Admin Delete Organization coach
import AdminDeleteOrganizationCoachTypeDefs from '../Settings/Preferences/Organizations/AdminDeleteOrganizationCoach/AdminDeleteOrganizationCoach.graphql';
import { AdminDeleteOrganizationCoachResolvers } from '../Settings/Preferences/Organizations/AdminDeleteOrganizationCoach/resolvers';
// Admin Delete Organization invite
import AdminDeleteOrganizationInvitesTypeDefs from '../Settings/Preferences/Organizations/AdminDeleteOrganizationInvites/AdminDeleteOrganizationInvites.graphql';
import { AdminDeleteOrganizationInvitesResolvers } from '../Settings/Preferences/Organizations/AdminDeleteOrganizationInvites/resolvers';

export const organizationSchema = [
  {
    typeDefs: GetOrganizationsTypeDefs,
    resolvers: GetOrganizationsResolvers,
  },
  {
    typeDefs: GetOrganizationAdminsTypeDefs,
    resolvers: GetOrganizationAdminsResolvers,
  },
  {
    typeDefs: GetOrganizationInvitesTypeDefs,
    resolvers: GetOrganizationInvitesResolvers,
  },
  {
    typeDefs: DeleteOrganizationAdminTypeDefs,
    resolvers: DeleteOrganizationAdminResolvers,
  },
  {
    typeDefs: DeleteOrganizationInviteTypeDefs,
    resolvers: DeleteOrganizationInviteResolvers,
  },
  {
    typeDefs: CreateOrganizationInviteTypeDefs,
    resolvers: CreateOrganizationInviteResolvers,
  },
  {
    typeDefs: SearchOrganizationsContactsTypeDefs,
    resolvers: SearchOrganizationsContactsResolvers,
  },
  {
    typeDefs: DeleteOrganizationContactTypeDefs,
    resolvers: DeleteOrganizationContactResolvers,
  },
  {
    typeDefs: SearchOrganizationsAccountListsTypeDefs,
    resolvers: SearchOrganizationsAccountListsResolvers,
  },
  {
    typeDefs: AdminDeleteOrganizationUserTypeDefs,
    resolvers: AdminDeleteOrganizationUserResolvers,
  },
  {
    typeDefs: AdminDeleteOrganizationCoachTypeDefs,
    resolvers: AdminDeleteOrganizationCoachResolvers,
  },
  {
    typeDefs: AdminDeleteOrganizationInvitesTypeDefs,
    resolvers: AdminDeleteOrganizationInvitesResolvers,
  },
];
