import { snakeToCamel } from 'src/lib/snakeToCamel';

export interface CreateGoogleIntegrationResponse {
  id: string;
  type: string;
  attributes: Omit<CreateGoogleIntegrationAttributes, 'id'>;
  relationships: Relationships;
}

type Relationships = {
  account_list: object[];
  google_account: object[];
};

export interface CreateGoogleIntegrationAttributes {
  calendar_id: string;
  calendar_integration: boolean;
  calendar_integrations: string[];
  calendar_name: string;
  calendars: Calendar[];
  created_at: string;
  updated_at: string;
  id: string;
  updated_in_db_at: string;
}

interface CreateGoogleIntegrationAttributesCamel {
  calendarId: string;
  calendarIntegration: boolean;
  calendarIntegrations: string[];
  calendarName: string;
  calendars: Calendar[];
  createdAt: string;
  updatedAt: string;
  id: string;
  updatedInDbAt: string;
}
type Calendar = {
  id: string;
  name: string;
};

export const CreateGoogleIntegration = (
  data: CreateGoogleIntegrationResponse,
): CreateGoogleIntegrationAttributesCamel => {
  const attributes = {} as Omit<CreateGoogleIntegrationAttributesCamel, 'id'>;
  Object.keys(data.attributes).forEach((key) => {
    attributes[snakeToCamel(key)] = data.attributes[key];
  });

  return {
    id: data.id,
    ...attributes,
  };
};
