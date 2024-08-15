import { fetchAllData } from 'src/lib/deserializeJsonApi';

export interface GoogleAccountsResponse {
  attributes: Omit<GoogleAccountAttributes, 'id'>;
  id: string;
  relationships: {
    contact_groups: {
      data: unknown[];
    };
  };
  type: string;
}

export interface GoogleAccountAttributes {
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

interface GoogleAccountAttributesCamel {
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
  contactGroups: ContactGroupCamel[];
}

type ContactGroupCamel = {
  id: string;
  createdAt: string;
  tag: string;
  title: string;
  updatedAt: string;
  updatedInDbAt: string;
};

export const GoogleAccounts = (response): GoogleAccountAttributesCamel[] => {
  return response.data.map((account) => {
    const attributes = fetchAllData(account, response.included) as Omit<
      GoogleAccountAttributesCamel,
      'id'
    >;
    return { id: account.id, ...attributes };
  });
};
