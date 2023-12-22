// Get Organizations
import AdminDeleteOrganizationCoachTypeDefs from '../Settings/Preferences/Organizations/AdminDeleteOrganizationCoach/AdminDeleteOrganizationCoach.graphql';
import { AdminDeleteOrganizationCoachResolvers } from '../Settings/Preferences/Organizations/AdminDeleteOrganizationCoach/resolvers';
import AdminDeleteOrganizationInvitesTypeDefs from '../Settings/Preferences/Organizations/AdminDeleteOrganizationInvites/AdminDeleteOrganizationInvites.graphql';
import { AdminDeleteOrganizationInvitesResolvers } from '../Settings/Preferences/Organizations/AdminDeleteOrganizationInvites/resolvers';
import AdminDeleteOrganizationUserTypeDefs from '../Settings/Preferences/Organizations/AdminDeleteOrganizationUser/AdminDeleteOrganizationUser.graphql';
import { AdminDeleteOrganizationUserResolvers } from '../Settings/Preferences/Organizations/AdminDeleteOrganizationUser/resolvers';
import CreateOrganizationInviteTypeDefs from '../Settings/Preferences/Organizations/CreateOrganizationInvite/CreateOrganizationInvite.graphql';
import { CreateOrganizationInviteResolvers } from '../Settings/Preferences/Organizations/CreateOrganizationInvite/resolvers';
import DeleteOrganizationAdminTypeDefs from '../Settings/Preferences/Organizations/DeleteOrganizationAdmin/DeleteOrganizationAdmin.graphql';
import { DeleteOrganizationAdminResolvers } from '../Settings/Preferences/Organizations/DeleteOrganizationAdmin/resolvers';
import DeleteOrganizationContactTypeDefs from '../Settings/Preferences/Organizations/DeleteOrganizationContact/DeleteOrganizationContact.graphql';
import { DeleteOrganizationContactResolvers } from '../Settings/Preferences/Organizations/DeleteOrganizationContact/resolvers';
import DeleteOrganizationInviteTypeDefs from '../Settings/Preferences/Organizations/DeleteOrganizationInvite/DeleteOrganizationInvite.graphql';
import { DeleteOrganizationInviteResolvers } from '../Settings/Preferences/Organizations/DeleteOrganizationInvite/resolvers';
import OrganizationAdminsTypeDefs from '../Settings/Preferences/Organizations/OrganizationAdmins/Organizations.graphql';
import { OrganizationAdminsResolvers } from '../Settings/Preferences/Organizations/OrganizationAdmins/resolvers';
import OrganizationInvitesTypeDefs from '../Settings/Preferences/Organizations/OrganizationInvites/OrganizationInvites.graphql';
import { OrganizationInvitesResolvers } from '../Settings/Preferences/Organizations/OrganizationInvites/resolvers';
import OrganizationsTypeDefs from '../Settings/Preferences/Organizations/Organizations/Organizations.graphql';
import { OrganizationsResolvers } from '../Settings/Preferences/Organizations/Organizations/resolvers';
import SearchOrganizationsAccountListsTypeDefs from '../Settings/Preferences/Organizations/SearchOrganizationsAccountLists/SearchOrganizationsAccountLists.graphql';
import { SearchOrganizationsAccountListsResolvers } from '../Settings/Preferences/Organizations/SearchOrganizationsAccountLists/resolvers';
import SearchOrganizationsContactsTypeDefs from '../Settings/Preferences/Organizations/SearchOrganizationsContacts/SearchOrganizationsContacts.graphql';
import { SearchOrganizationsContactsResolvers } from '../Settings/Preferences/Organizations/SearchOrganizationsContacts/resolvers';

export const organizationSchema = [
  {
    typeDefs: OrganizationsTypeDefs,
    resolvers: OrganizationsResolvers,
  },
  {
    typeDefs: OrganizationAdminsTypeDefs,
    resolvers: OrganizationAdminsResolvers,
  },
  {
    typeDefs: OrganizationInvitesTypeDefs,
    resolvers: OrganizationInvitesResolvers,
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
