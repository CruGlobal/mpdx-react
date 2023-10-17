import {
  GetOrganizationInvitesResponse,
  OrganizationInviteCamelCase,
} from '../helper';

export const GetOrganizationInvites = (
  data: GetOrganizationInvitesResponse,
): OrganizationInviteCamelCase[] => {
  return data.data.reduce((prev: OrganizationInviteCamelCase[], current) => {
    const admin = {
      id: current.id,
      acceptedAt: current.attributes.accepted_at,
      createdAt: current.attributes.created_at,
      code: current.attributes.code,
      inviteUserAs: current.attributes.invite_user_as,
      recipientEmail: current.attributes.recipient_email,
    } as OrganizationInviteCamelCase;

    return prev.concat([admin]);
  }, []);
};
