export interface GetOrganizationInvitesResponse {
  data: OrganizationInvite[];
  meta: {
    filter: object;
    sort: string;
    pagination: {
      page: number;
      per_page: number;
      total_count: number;
      total_pages: number;
    };
  };
}

export interface OrganizationInvite {
  id: string;
  type: string;
  attributes: {
    accepted_at: string | null;
    created_at: string;
    code: string;
    invite_user_as: string;
    recipient_email: string;
    updated_at: string;
    updated_in_db_at: string;
  };
}

export interface OrganizationInviteCamelCase {
  id: string;
  acceptedAt: string | null;
  createdAt: string;
  code: string;
  inviteUserAs: string;
  recipientEmail: string;
}
