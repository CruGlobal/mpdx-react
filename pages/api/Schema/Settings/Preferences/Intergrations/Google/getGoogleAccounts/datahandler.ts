import { snakeToCamel } from 'src/lib/snakeToCamel';

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

interface GetGoogleAccountAttributesCamel {
  id: string;
  createdAt: string;
  email: string;
  expiresAt: string;
  lastDownload: string;
  lastEmailSync: string;
  primary: boolean;
  remoteId: string;
  tokenExpired: boolean;
  updatedAt: string;
  updatedInDbAt: string;
}

export const GetGoogleAccounts = (
  data: GetGoogleAccountsResponse[],
): GetGoogleAccountAttributesCamel[] => {
  return data.reduce((prev: GetGoogleAccountAttributesCamel[], current) => {
    const attributes = {} as Omit<GetGoogleAccountAttributesCamel, 'id'>;
    Object.keys(current.attributes).map((key) => {
      attributes[snakeToCamel(key)] = current.attributes[key];
    });

    return prev.concat([{ id: current.id, ...attributes }]);
  }, []);
};
