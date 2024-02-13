import {
  OrganizationInviteCamelCase,
  OrganizationInvitesResponse,
} from '../helper';

export const OrganizationInvites = (
  data: OrganizationInvitesResponse,
): OrganizationInviteCamelCase[] => {
  return data.data.map((invite) => ({
    id: invite.id,
    acceptedAt: invite.attributes.accepted_at,
    createdAt: invite.attributes.created_at,
    code: invite.attributes.code,
    inviteUserAs: invite.attributes.invite_user_as,
    recipientEmail: invite.attributes.recipient_email,
  }));
};
