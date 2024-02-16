// Get Organizations
import AdminDeleteOrganizationCoachTypeDefs from '../Settings/Organizations/AdminDeleteOrganizationCoach/AdminDeleteOrganizationCoach.graphql';
import { AdminDeleteOrganizationCoachResolvers } from '../Settings/Organizations/AdminDeleteOrganizationCoach/resolvers';
import AdminDeleteOrganizationInvitesTypeDefs from '../Settings/Organizations/AdminDeleteOrganizationInvites/AdminDeleteOrganizationInvites.graphql';
import { AdminDeleteOrganizationInvitesResolvers } from '../Settings/Organizations/AdminDeleteOrganizationInvites/resolvers';
import AdminDeleteOrganizationUserTypeDefs from '../Settings/Organizations/AdminDeleteOrganizationUser/AdminDeleteOrganizationUser.graphql';
import { AdminDeleteOrganizationUserResolvers } from '../Settings/Organizations/AdminDeleteOrganizationUser/resolvers';
import CreateOrganizationInviteTypeDefs from '../Settings/Organizations/CreateOrganizationInvite/CreateOrganizationInvite.graphql';
import { CreateOrganizationInviteResolvers } from '../Settings/Organizations/CreateOrganizationInvite/resolvers';
import DeleteOrganizationAdminTypeDefs from '../Settings/Organizations/DeleteOrganizationAdmin/DeleteOrganizationAdmin.graphql';
import { DeleteOrganizationAdminResolvers } from '../Settings/Organizations/DeleteOrganizationAdmin/resolvers';
import DeleteOrganizationContactTypeDefs from '../Settings/Organizations/DeleteOrganizationContact/DeleteOrganizationContact.graphql';
import { DeleteOrganizationContactResolvers } from '../Settings/Organizations/DeleteOrganizationContact/resolvers';
import DeleteOrganizationInviteTypeDefs from '../Settings/Organizations/DeleteOrganizationInvite/DeleteOrganizationInvite.graphql';
import { DeleteOrganizationInviteResolvers } from '../Settings/Organizations/DeleteOrganizationInvite/resolvers';
import OrganizationAdminsTypeDefs from '../Settings/Organizations/OrganizationAdmins/Organizations.graphql';
import { OrganizationAdminsResolvers } from '../Settings/Organizations/OrganizationAdmins/resolvers';
import OrganizationInvitesTypeDefs from '../Settings/Organizations/OrganizationInvites/OrganizationInvites.graphql';
import { OrganizationInvitesResolvers } from '../Settings/Organizations/OrganizationInvites/resolvers';
import OrganizationsTypeDefs from '../Settings/Organizations/Organizations/Organizations.graphql';
import { OrganizationsResolvers } from '../Settings/Organizations/Organizations/resolvers';
import SearchOrganizationsAccountListsTypeDefs from '../Settings/Organizations/SearchOrganizationsAccountLists/SearchOrganizationsAccountLists.graphql';
import { SearchOrganizationsAccountListsResolvers } from '../Settings/Organizations/SearchOrganizationsAccountLists/resolvers';
import SearchOrganizationsContactsTypeDefs from '../Settings/Organizations/SearchOrganizationsContacts/SearchOrganizationsContacts.graphql';
import { SearchOrganizationsContactsResolvers } from '../Settings/Organizations/SearchOrganizationsContacts/resolvers';

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
