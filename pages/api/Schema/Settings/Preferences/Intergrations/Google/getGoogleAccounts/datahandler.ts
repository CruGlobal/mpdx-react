export interface GetGoogleAccountsResponse {
  attributes: Omit<GetGoogleAccountAttributes, 'id'>;
  id: string;
  relationships: {
    contact_groups: {
      data: unknown[];
    };
  };
  type: string;
}

export interface GetGoogleAccountAttributes {
  id: string;
  created_at: string;
  email: string;
  expires_at: string;
  last_download: string;
  last_email_sync: string;
  primary: boolean;
  remote_id: string;
  token_expired: boolean;
  updated_at: string;
  updated_in_db_at: string;
}

export const GetGoogleAccounts = (
  data: GetGoogleAccountsResponse[],
): GetGoogleAccountAttributes[] => {
  return data.reduce((prev: GetGoogleAccountAttributes[], current) => {
    return prev.concat([{ id: current.id, ...current.attributes }]);
  }, []);
};
