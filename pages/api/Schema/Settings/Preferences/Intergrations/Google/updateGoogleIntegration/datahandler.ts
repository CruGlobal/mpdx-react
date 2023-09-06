import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface UpdateGoogleIntegrationResponse {
  id: string;
  type: string;
  attributes: Omit<SaveGoogleIntegrationAttributes, 'id'>;
  relationships: relationships;
}

type relationships = {
  account_list: object[];
  google_account: object[];
};

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

interface GetGoogleAccountIntegrationAttributesCamel {
  calendarId: string;
  calendarIntegration: boolean;
  calendarIntegrations: string[];
  calendarName: string;
  calendars: calendars[];
  createdAt: string;
  updatedAt: string;
  id: string;
  updatedInDbAt: string;
}
type calendars = {
  id: string;
  name: string;
};

export const UpdateGoogleIntegration = (
  data: UpdateGoogleIntegrationResponse,
): GetGoogleAccountIntegrationAttributesCamel => {
  const attributes = {} as Omit<
    GetGoogleAccountIntegrationAttributesCamel,
    'id'
  >;
  Object.keys(data.attributes).map((key) => {
    attributes[snakeToCamel(key)] = data.attributes[key];
  });

  return {
    id: data.id,
    ...attributes,
  };
};
