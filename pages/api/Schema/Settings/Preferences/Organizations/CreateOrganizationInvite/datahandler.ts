import { OrganizationInvite, OrganizationInviteCamelCase } from '../helper';

export const CreateOrganizationInvite = (
  data: OrganizationInvite,
): OrganizationInviteCamelCase => {
  const {
    accepted_at = null,
    created_at,
    code,
    invite_user_as,
    recipient_email,
  } = data.attributes;
  return {
    id: data.id,
    acceptedAt: accepted_at,
    createdAt: created_at,
    code: code,
    inviteUserAs: invite_user_as,
    recipientEmail: recipient_email,
  };
};
