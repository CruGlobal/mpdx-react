export interface UpdateGoogleIntegrationResponse {
  id: string;
  type: string;
  attributes: Omit<SaveGoogleIntegrationAttributes, 'id'>;
  relationships: relationships;
}

export interface SaveGoogleIntegrationAttributes {
  calendar_id: string;
  calendar_integration: boolean;
  calendar_integrations: string[];
  calendar_name: string;
  calendars: calendars[];
  created_at: string;
  updated_at: string;
  id: string;
  updated_in_db_at: string;
}
type calendars = {
  id: string;
  name: string;
};

type relationships = {
  account_list: object[];
  google_account: object[];
};

export const UpdateGoogleIntegration = (
  data: UpdateGoogleIntegrationResponse,
): SaveGoogleIntegrationAttributes => {
  return {
    id: data.id,
    ...data.attributes,
  };
};
